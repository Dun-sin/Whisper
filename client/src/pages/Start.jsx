import { useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { NEW_EVENT_CLOSE, NEW_EVENT_INACTIVE, NEW_EVENT_JOIN } from '../../../constants.json';
import { RiUserSearchLine } from 'react-icons/ri';

// Store
import { connectWithId, socket } from 'src/lib/socketConnection';
import { createClassesFromArray } from 'src/lib/utils';
import { useApp } from 'src/context/AppContext';
import { useNotification } from 'src/lib/notification';

import { useAuth } from 'src/context/AuthContext';
import { useChat } from 'src/context/ChatContext';
import useCheckTimePassed from 'src/hooks/useCheckTimePassed';

import { requestBrowserNotificationPermissions } from 'src/lib/browserNotification';

const centerElement = 'flex flex-col items-center justify-center';

const Start = () => {
	const { app } = useApp();
	const { clearTimer } = useCheckTimePassed();
	const navigate = useNavigate();
	const { playNotification } = useNotification();
	useEffect(() => {
		if (app.isSearching) {
			navigate('/founduser');
		}

		requestBrowserNotificationPermissions();
	}, []);
	const { authState } = useAuth();
	const { closeChat } = useChat();

	const onClose = useCallback((chatId) => {
		closeChat(chatId);
		playNotification('chatClosed');

		if (!confirm('This chat is closed! Would you like to search for a new buddy?')) {
			navigate('/');
			return;
		}
	}, []);
	const onConnect = useCallback(() => {
		socket.emit(NEW_EVENT_JOIN, {
			loginId: authState.loginId,
			email: authState.email,
		});
	}, []);

	const onInactive = useCallback(() => {
		closeChat(app.currentChatId);
	}, []);

	const emitClose = useCallback((err, chatClosed) => {
		if (err) {
			alert('An error occured whiles closing chat.');
			return err;
		}

		if (chatClosed) {
			closeChat(app.currentChatId);
			app.currentChatId = null;
		} else {
			navigate('/');
		}

		clearTimer();
	}, []);
	useEffect(() => {
		if (!socket.connected) {
			connectWithId(app.currentChatId);
		}
		socket.on('connect', onConnect);

		socket.on(NEW_EVENT_CLOSE, onClose);

		socket.on(NEW_EVENT_INACTIVE, onInactive);
		return () => {
			socket.off('connect', onConnect);
			socket.off(NEW_EVENT_CLOSE, onClose);
			socket.off(NEW_EVENT_INACTIVE, onInactive);
			socket.disconnect();
		};
	}, []);

	const doCloseChat = () => {

		if (!socket.connected) {
			connectWithId(app.currentChatId);
		}
		socket.timeout(30000).emit(NEW_EVENT_CLOSE, app.currentChatId, emitClose);
	};

	return (
		<div
			className={createClassesFromArray([
				centerElement,
				'bg-light',
				'dark:bg-primary',
				'min-w-[calc(100%-120px)]',
				'text-primary',
				'dark:text-white',
				'min-h-full',
			])}
		>
			<RiUserSearchLine style={{ transform: 'scale(8)' }} className="text-secondary mb-6" />
			<h1 className="text-[calc(1.2vh+1.2vh+1.2vmin)]">Search For Someone</h1>

			{/* from the below link user will trigger search of another user*/}
			<Link
				to="/founduser"
				className={createClassesFromArray([
					centerElement,
					'hover:no-underline',
					'hover:text-black',
					'font-medium',
					'text-black',
					'text-[1.5em]',
					'w-[8em]',
					'h-[2.3em]',
					'mt-[-5px]',
					'rounded-[30px]',
					'transition duration-300 ease-in-out',
					'bg-[#FF9F1C] hover:bg-[#FBBF24]',
				])}
			>
				{app.currentChatId ? 'Open Chat' : 'Start'}
			</Link>
			{app.currentChatId ? (
				<button
					className={createClassesFromArray([
						centerElement,
						'hover:no-underline',
						'hover:text-black',
						'font-medium',
						'text-black',
						'text-[1.5em]',
						'w-[8em]',
						'h-[2.3em]',

						'mt-[5px]',
						'rounded-[30px]',
						'transition duration-300 ease-in-out',
						'bg-[#EF4444] hover:bg-[#F87171]',
					])}
					onClick={() => {
						doCloseChat();
					}}
				>
					Close Chat
				</button>
			) : (
				''
			)}
		</div>
	);
};

export default Start;
