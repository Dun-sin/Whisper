import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
	NEW_EVENT_CLOSE,
	NEW_EVENT_DELETE_MESSAGE,
	NEW_EVENT_DISPLAY,
	NEW_EVENT_EDIT_MESSAGE,
	NEW_EVENT_RECEIVE_MESSAGE,
	NEW_EVENT_ONLINE_STATUS,
} from '../../../constants.json';
// Rsuite
import { Dropdown, IconButton, Tooltip, Whisper } from 'rsuite';
import { Icon } from '@rsuite/icons';

// Icons
import { BiArrowBack, BiDotsVerticalRounded } from 'react-icons/bi';

// Store
import { SocketContext } from 'src/context/Context';
import { useChat } from 'src/context/ChatContext';
import { useApp } from 'src/context/AppContext';
import { useDialog } from 'src/context/DialogContext';

// Components
import Chat from 'components/Chat';
import { createClassesFromArray, isExplicitDisconnection } from 'src/lib/utils';

import useKeyPress, { ShortcutFlags } from 'src/hooks/useKeyPress';

const centerItems = `flex items-center justify-center`;

const Anonymous = ({ onChatClosed }) => {
	const { app, endSearch } = useApp();
	const { currentChatId, onlineStatus } = app;
	const currentChatIdRef = useRef(currentChatId);

	const [isTyping, setIsTyping] = useState(false);
	const [autoSearchAfterClose, setAutoSearchAfterClose] = useState(false);
	const [disconnected, setDisconnected] = useState(false);
	const [buddyOnlineStatus, setBuddyOnlineStatus] = useState(null)

	const autoSearchRef = useRef();
	autoSearchRef.current = autoSearchAfterClose;
	/**
	 * @type {React.MutableRefObject<null | ReturnType<setTimeout>>}
	 */
	const typingStatusTimeoutRef = useRef(null);

	const navigate = useNavigate();
	const socket = useContext(SocketContext);
	const { closeChat } = useChat();
	const { setDialog } = useDialog();

	socket.on(NEW_EVENT_DISPLAY, ({ isTyping, chatId }) => {
		// eslint-disable-next-line curly
		if (chatId !== currentChatId) return;
		if (!isTyping) {
			setIsTyping(false);
			return;
		}

		setIsTyping(true);

		if (typingStatusTimeoutRef.current) {
			clearTimeout(typingStatusTimeoutRef.current);
		}

		typingStatusTimeoutRef.current = setTimeout(() => {
			setIsTyping(false);
		}, 3000);
	});

	const closeChatHandler = (autoSearch = false) => {
		const currentChatId = currentChatIdRef.current;

		if (!currentChatId) {
			navigate('/');
			return;
		}

		setAutoSearchAfterClose(autoSearch);

		socket.timeout(30000).emit(NEW_EVENT_CLOSE, currentChatId, (err, chatClosed) => {
			if (err) {
				alert('An error occured whiles closing chat.');
				setAutoSearchAfterClose(false);
				return err;
			}

			if (chatClosed) {
				closeChat(currentChatId);
			}

			endSearch();

			if (chatClosed && autoSearchRef.current) {
				if (onChatClosed) {
					onChatClosed();
				}

				setAutoSearchAfterClose(false);
			} else {
				navigate('/');
			}
		});
	};

	const MenuToggle = (props, ref) => {
		return (
			<IconButton
				{...props}
				ref={ref}
				icon={<Icon as={BiDotsVerticalRounded} />}
				appearance="subtle"
				circle
			/>
		);
	};

	const handleClose = (autoSearch = false) => {
		setDialog({
			isOpen: true,
			text: 'Are you sure you want to close this chat?',
			handler: () => closeChatHandler(autoSearch),
		});
	};

	useKeyPress(['x'], () => handleClose(), ShortcutFlags.ctrl | ShortcutFlags.shift);
	useKeyPress(['n'], () => handleClose(true), ShortcutFlags.ctrl | ShortcutFlags.alt);

	useEffect(() => {
		const newMessageEvents = [
			NEW_EVENT_RECEIVE_MESSAGE,
			NEW_EVENT_DELETE_MESSAGE,
			NEW_EVENT_EDIT_MESSAGE,
		];

		const connectionEvents = {
			connect: () => {
				setDisconnected(false);
			},

			disconnect: (reason) => {
				setDisconnected(!isExplicitDisconnection(reason));
			},
		};

		function onNewMessage() {
			setIsTyping(false);
		}

		const onlineStatushandler = (onlineStatusState) => {
			if (!onlineStatusState.includes('online')) {
				const date = new Date(onlineStatusState);
				const today = new Date();
				// Set today's date to the beginning of the day
				today.setHours(0, 0, 0, 0);
				const yesterday = new Date(today);
				yesterday
					.setDate(
						yesterday
							.getDate() - 1
					); // Set it to yesterday

				let formattedDate;
				if (date >= today) {
					// Today
					const options = { hour: '2-digit', minute: '2-digit' };
					formattedDate = `Last seen today at ${date.toLocaleString('en-US', options)}`;
				} else if (date >= yesterday) {
					// Yesterday
					const options = { hour: '2-digit', minute: '2-digit' };
					formattedDate = `Last seen yesterday at ${date.toLocaleString('en-US', options)}`;
				} else {
					// More than yesterday
					const options = { year: 'numeric', month: 'short', day: 'numeric' };
					formattedDate = date.toLocaleString('en-US', options);
				}
				setBuddyOnlineStatus(formattedDate)

				return
			}
			setBuddyOnlineStatus(onlineStatusState)
		}

		for (const event in connectionEvents) {
			socket.on(event, connectionEvents[event]);
		}

		newMessageEvents.forEach((event) => {
			socket.on(event, onNewMessage);
		});

		socket.on(NEW_EVENT_ONLINE_STATUS, onlineStatushandler);

		return () => {
			socket.off(NEW_EVENT_ONLINE_STATUS, onlineStatushandler);

			newMessageEvents.forEach((event) => {
				socket.off(event, onNewMessage);
			});

			for (const event in connectionEvents) {
				socket.off(event, connectionEvents[event]);
			}
		};
	}, []);

	useEffect(() => {
		if (!onlineStatus) {
			return
		}

		socket.timeout(5000)
			.emit(
				NEW_EVENT_ONLINE_STATUS,
				{ onlineStatus, chatId: currentChatId })

	}, [onlineStatus])

	return (
		<div
			className={createClassesFromArray([
				centerItems,
				'bg-light',
				'dark:bg-primary',
				'md:min-w-[calc(100%-108px)]',
				'min-w-full',
				'flex-col',
				'h-full',
				'text-primary',
				'dark:text-white',
			])}
		>
			{disconnected && (
				<div className="bg-red w-full text-center">You&apos;ve lost your connection.</div>
			)}
			<div className="flex items-center justify-between border-b-[2px] px-5 border-secondary h-[10%] w-[100%]">
				<div className="md:hidden">
					<Whisper
						placement="auto"
						controlId="control-id-hover"
						trigger="hover"
						speaker={<Tooltip>Home</Tooltip>}
					>
						<IconButton
							onClick={() => navigate('/')}
							appearance="subtle"
							className="bg-primary "
							icon={<Icon as={BiArrowBack} />}
							circle
						/>
					</Whisper>
				</div>
				<div className='flex flex-col gap-2 items-center sm:items-start'>
					<h2 className=" text-xl font-semibold">Anonymous User</h2>
					<div className='flex items-center gap-3'>
						{isTyping && <span>Typing</span>}
						{buddyOnlineStatus && <span className=' text-gray-400 text-sm'>{buddyOnlineStatus}</span>}
					</div>
				</div>

				<Dropdown placement="leftStart" style={{ zIndex: 3 }} renderToggle={MenuToggle} noCaret>
					<Dropdown.Item onClick={() => handleClose()} className='sm:w-[200px]'>
						<div className="flex justify-between gap-2 flex-wrap">
							<span>Close Chat</span>
							<span className="text-gray-500 text-xs">Ctrl + Shift + X</span>
                        </div>
                    </Dropdown.Item>

					<Dropdown.Item onClick={() => handleClose(true)} className='sm:w-[200px]'>
						<div className="flex items-center justify-between gap-2 flex-wrap">
							<span>Find a new buddy</span>
							<span className="text-gray-500 text-xs">Ctrl + Alt + N</span>
                        </div>
                    </Dropdown.Item>
				</Dropdown>
			</div>
			<div
				className={createClassesFromArray([
					centerItems,
					'flex-col',
					'w-[90%]',
					'h-full',
					'flex-auto',
				])}
			>
				<Chat />
			</div>
		</div>
	);
};

export default Anonymous;

Anonymous.propTypes = {
	onChatClosed: PropTypes.func,
};
