import { useCallback, useEffect, useState } from 'react';
import ThreeDots from 'react-loading-icons/dist/esm/components/three-dots';
import { useNavigate } from 'react-router-dom';
import { useApp } from 'src/context/AppContext';
import { ChatProvider, useChat } from 'src/context/ChatContext';
import useCloseChat from 'src/hooks/useCloseChat';
import { createBrowserNotification } from 'src/lib/browserNotification';
import { useNotification } from 'src/lib/notification';
import { connectWithId, socket } from 'src/lib/socketConnection';
import {
	NEW_EVENT_JOIN,
	NEW_EVENT_JOINED,
	NEW_EVENT_STOP_SEARCH,
	NEW_EVENT_STOP_SEARCH_SUCCESS,
} from '../../../constants.json';
import { useAuth } from 'src/context/AuthContext';

const stoppingSearchLoadingText = <p>Stopping the search</p>;
const defaultLoadingText = <p>Looking for a random buddy</p>;

const Searching = () => {
	const { startSearch, endSearch, app } = useApp();
	const { setLoadingText, loadingText } = useCloseChat();
	const { createChat } = useChat();
	const { authState } = useAuth();
	const { playNotification } = useNotification();
	const navigate = useNavigate();

	const [isStoppingSearch, setIsStoppingSearch] = useState(false);

	let timeout = null;

	const onConnect = useCallback(() => {
		socket.emit(NEW_EVENT_JOIN, {
			loginId: authState.loginId,
			email: authState.email,
		});
	}, []);

	const onUserJoined = useCallback(({ roomId, userIds }) => {
		playNotification('buddyPaired');
		createBrowserNotification(
			"Let's Chat :)",
			"You've found a match, don't keep your Partner waiting ⌛"
		);
		createChat(roomId, userIds);
		endSearch(roomId);
		navigate('/founduser');
	}, []);

	const onStopSearch = useCallback(() => {
		setIsStoppingSearch(false);
		endSearch();
		navigate('/');
	}, []);

	const emitStopSearch = useCallback(() => {
		socket.emit(NEW_EVENT_STOP_SEARCH, {
			loginId: authState.loginId,
			email: authState.email,
		});
	}, []);

	const handleStopSearch = () => {
		emitStopSearch();
		setIsStoppingSearch(true);
	};

	useEffect(() => {
		setLoadingText(isStoppingSearch ? stoppingSearchLoadingText : defaultLoadingText);
	}, [isStoppingSearch]);

	useEffect(() => {
		if (loadingText === defaultLoadingText) {
			timeout = setTimeout(() => {
				setLoadingText(
					<>
						<p>
							Taking too long? <br className="md:hidden" />
							No <span className="hidden sm:inline">chat</span> buddy is currently available :({' '}
						</p>
						<p>
							<a
								href="https://ctt.ac/US0h0"
								target="_blank"
								rel="noreferrer"
								className="text-blue-500 underline"
							>
								Tweet
							</a>{' '}
							about this app and get more people to use it!
						</p>
					</>
				);
			}, 15000);
		}

		return () => {
			clearTimeout(timeout);
		};
	}, [loadingText]);

	useEffect(() => {
		const setupSocket = async () => {
			if (!app.currentChatId) {
				startSearch();
			}

			if (!socket.connected) {
				try {
					await connectWithId(app.currentChatId);
				} catch (error) {
					console.error('Failed to connect:', error);
				}
			}
		};

		setupSocket();

		socket.on('connect', onConnect);
		socket.on(NEW_EVENT_JOINED, onUserJoined);
		socket.on(NEW_EVENT_STOP_SEARCH_SUCCESS, onStopSearch);

		return () => {
			socket.off('connect', onConnect).off(NEW_EVENT_JOINED, onUserJoined);

			socket.disconnect();
		};
	}, [app.currentChatId]);
	return (
		<ChatProvider>
			<div className="flex w-full justify-center items-center min-h-[calc(100vh-70px)] flex-col bg-light dark:bg-primary">
				<ThreeDots fill="rgb(255 159 28)" />
				<div className="text-lg text-center text-primary dark:text-white">{loadingText}</div>
				{!isStoppingSearch && (
					<button
						onClick={handleStopSearch}
						className={
							'hover:no-underline hover:text-white font-medium text-white text-[1.5em] w-[8em] h-[2.3em] mt-4 rounded-[30px] bg-[#FF3A46] flex flex-col items-center justify-center'
						}
					>
						Stop
					</button>
				)}
			</div>
		</ChatProvider>
	);
};

export default Searching;
