/* eslint-disable max-len */
import { useEffect, useRef, useContext, useMemo, useState } from 'react';
import { SocketContext } from 'context/Context';

import ScrollToBottom from 'react-scroll-to-bottom';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

import { v4 as uuid } from 'uuid';
import { throttle } from 'lodash';
import MarkdownIt from 'markdown-it';

import { useChat } from 'src/context/ChatContext';
import { useAuth } from 'src/context/AuthContext';
import { useApp } from 'src/context/AppContext';

import useChatUtils from 'src/lib/chatSocket';
import MessageStatus from './MessageStatus';
import listOfBadWordsNotAllowed from 'src/lib/badWords';
import { useNotification } from 'src/lib/notification';
import {
	NEW_EVENT_DELETE_MESSAGE,
	NEW_EVENT_EDIT_MESSAGE,
	NEW_EVENT_RECEIVE_MESSAGE,
	NEW_EVENT_TYPING,
} from '../../../constants.json';
import { createBrowserNotification } from 'src/lib/browserNotification';

import chatHelper,
{
	adjustTextareaHeight,
	checkPartnerResponse,
	getTime
} from '../lib/chatHelper';

import MessageInput from './Chat/MessageInput';
import DropDownOptions from './Chat/DropDownOption';
import PreviousMessages from './Chat/PreviousMessages';


const inactiveTimeThreshold = 180000; // 3 mins delay
let senderId;
let inactiveTimeOut;

const Chat = () => {
	const { app } = useApp();
	const { playNotification } = useNotification();
	const [editing, setEditing] = useState({
		isediting: false,
		messageID: null,
	});
	const [isQuoteReply, setIsQuoteReply] = useState(false);
	const [message, setMessage] = useState('');
	const [quoteMessage, setQuoteMessage] = useState(null);
	// use the id so we can track what message's previousMessage is open
	const [openPreviousMessages, setOpenPreviousMessages] = useState(null);

	const { messages: state, addMessage, updateMessage, removeMessage, editText } = useChat();
	const { authState, dispatchAuth } = useAuth();
	const { logout } = useKindeAuth();
	const socket = useContext(SocketContext);

	const { sendMessage, editMessage } = useChatUtils(socket);
	const { getMessage, handleResend } = chatHelper(state, app)

	const inputRef = useRef('');

	const [lastMessageTime, setLastMessageTime] = useState(null);

	senderId = authState.email ?? authState.loginId;

	const md = new MarkdownIt({
		html: false,
		linkify: true,
		typographer: true,
	});

	function logOut() {
		dispatchAuth({
			type: 'LOGOUT',
		});
		logout();
	}

	const cancelEdit = () => {
		inputRef.current.value = '';
		setEditing({ isediting: false, messageID: null });
		socket.timeout(10000).emit(NEW_EVENT_TYPING, { chatId: app.currentChatId, isTyping: false });
	};

	const sortedMessages = useMemo(
		() =>
			Object.values(state[app.currentChatId]?.messages ?? {})?.sort((a, b) => {
				const da = new Date(a.time),
					db = new Date(b.time);
				return da - db;
			}),
		[state, app.currentChatId]
	);

	const doSend = async ({ senderId, room, tmpId = uuid(), message, time }) => {
		try {
			addMessage({
				senderId,
				room,
				id: tmpId,
				message,
				time,
				status: 'pending',
			});
		} catch {
			logOut();
			return false;
		}

		try {
			const sentMessage = await sendMessage({
				senderId,
				message,
				time,
				chatId: room,
			});

			try {
				updateMessage(tmpId, sentMessage);
			} catch {
				logOut();
				return false;
			}
		} catch (e) {
			try {
				updateMessage(tmpId, {
					senderId,
					room,
					id: tmpId,
					message,
					time,
					status: 'failed',
				});
			} catch {
				logOut();
			}

			return false;
		}

		return true;
	};

	// Here whenever user will submit message it will be send to the server
	const handleSubmit = async (e) => {
		e.preventDefault();

		socket.emit(NEW_EVENT_TYPING, { chatId: app.currentChatId, isTyping: false });
		const d = new Date();
		let message = inputRef.current.value.trim(); // Trim the message to remove the extra spaces

		if (!isQuoteReply) {
			const cleanedText = message.replace(/>+/g, '');
			message = cleanedText;
		}

		if (message === '' || senderId === undefined || senderId === '123456') {
			return;
		}

		if (isQuoteReply && message.trim() === quoteMessage.trim()) {
			return;
		}

		setIsQuoteReply(false);
		setQuoteMessage(null);

		const splitMessage = message.split(' ');
		for (const word of splitMessage) {
			// TODO: We need a better way to implement this
			if (listOfBadWordsNotAllowed.includes(word)) {
				message = 'Warning Message: send a warning to users';
			}
		}

		if (editing.isediting === true) {
			try {
				const oldMessage = getMessage(editing.messageID, state, app).message;
				await editMessage({
					id: editing.messageID,
					chatId: app.currentChatId,
					newMessage: message,
					oldMessage,
				});
				editText(editing.messageID, app.currentChatId, message, oldMessage);
				const messageObject = getMessage(editing.messageID, state, app);

				updateMessage(editing.messageID, messageObject, true);
			} catch {
				setEditing({ isediting: false, messageID: null });
				return;
			}
			setEditing({ isediting: false, messageID: null });
		} else {
			doSend({
				senderId,
				room: app.currentChatId,
				message,
				time: d.getTime(),
			});
		}

		if (inputRef.current) {
			inputRef.current.value = '';
			setMessage('');
			inputRef.current.focus();
		}
	};

	const handleTypingStatus = throttle((e) => {
		if (e.target.value.length > 0) {
			socket.timeout(5000).emit(NEW_EVENT_TYPING, { chatId: app.currentChatId, isTyping: true });
		}
		setMessage(e.target.value);
		adjustTextareaHeight(inputRef);
	}, 500);

	const openPreviousEdit = (messageId) => {
		if (openPreviousMessages === messageId) {
			setOpenPreviousMessages(null);
		} else {
			setOpenPreviousMessages(messageId);
		}
	};

	const warningMessage = (sender, message) => {
		// TODO: Instrad of replacing the message we should add some kind of increment for the users to decide to see the message or not
		if (message.includes('Warning Message')) {
			if (senderId === sender) {
				return <span className="text-red">ADMIN MESSAGE: You are trying to send a bad word!</span>;
			} else {
				return (
					<span className="text-black">
						ADMIN MESSAGE: The person you are chatting with is trying to send a bad word!
					</span>
				);
			}
		}
	};

	// Clear chat when escape is pressed
	useEffect(() => {
		const keyDownHandler = (event) => {
			if (event.key === 'Escape' && editing.isediting) {
				event.preventDefault();
				cancelEdit();
			}
		};

		document.addEventListener('keydown', keyDownHandler);

		return () => {
			document.removeEventListener('keydown', keyDownHandler);
		};
	}, [editing]);

	useEffect(() => {
		const newMessageHandler = (message) => {
			try {
				addMessage(message);
				playNotification('newMessage');
				createBrowserNotification('You received a new message on Whisper', message.message);
			} catch {
				logOut();
			}
		};

		const deleteMessageHandler = ({ id, chatId }) => {
			removeMessage(id, chatId);
		};

		const editMessageHandler = ({ id, chatId, newMessage, oldMessage }) => {
			editText(id, chatId, newMessage, oldMessage);
		};

		// This is used to recive message form other user.
		socket.on(NEW_EVENT_RECEIVE_MESSAGE, newMessageHandler);
		socket.on(NEW_EVENT_DELETE_MESSAGE, deleteMessageHandler);
		socket.on(NEW_EVENT_EDIT_MESSAGE, editMessageHandler);

		return () => {
			socket.off(NEW_EVENT_RECEIVE_MESSAGE, newMessageHandler);
			socket.off(NEW_EVENT_DELETE_MESSAGE, deleteMessageHandler);
			socket.off(NEW_EVENT_EDIT_MESSAGE, editMessageHandler);
		};
	}, []);

	useEffect(() => {
		const newLastMessageTime = sortedMessages
			.filter((message) => message.senderId !== senderId)
			.pop()?.time;
		if (newLastMessageTime !== lastMessageTime) {
			setLastMessageTime(newLastMessageTime);
			clearTimeout(inactiveTimeOut);
			inactiveTimeOut = setTimeout(() => {
				checkPartnerResponse(lastMessageTime, inactiveTimeThreshold);
			}, inactiveTimeThreshold);

		}
	}, [sortedMessages]);

	return (
		<div className="w-full md:h-[90%] min-h-[100%] pb-[25px] flex flex-col justify-between gap-6">
			<div className="max-h-[67vh]">
				<p className="text-[0.8em] font-semibold mb-[10px] mt-[20px] text-center">
					Connected with a random User
					{sortedMessages.length === 0 && ', Be the first to send {"Hello"}'}
				</p>
				<ScrollToBottom
					initialScrollBehavior="auto"
					className="h-[100%] md:max-h-full overflow-y-scroll w-full scroll-smooth"
				>
					{sortedMessages.map(
						({ senderId: sender, id, message, time, status, isEdited, oldMessages }) => {
							const resultOfWarningMessage = warningMessage(sender, message);
							!(resultOfWarningMessage === undefined) && (message = resultOfWarningMessage);
							return (
								<div
									key={id}
									className={`w-full flex text-white relative ${
										sender.toString() === senderId.toString() ? 'justify-end' : 'justify-start'
									}`}
								>
									<div
										className={`flex flex-col mb-[2px] min-w-[10px] mdl:max-w-[80%] max-w-[50%] ${
											sender.toString() === senderId.toString() ? 'items-end' : 'items-start'
										}`}
									>
										<div
											className={`chat bg-red p-3 break-all will-change-auto flex gap-6 items-center text ${
												sender.toString() === senderId.toString()
													? 'justify-between bg-secondary rounded-l-md'
													: 'rounded-r-md'
											}`}
										>
											{typeof message === 'string' ? (
												<span dangerouslySetInnerHTML={{ __html: md.render(message) }} />
											) : (
												message
											)}

											<DropDownOptions
												isSender={
													sender.toString() === senderId.toString()
													&& status !== 'pending'}
												id={id}
												inputRef={inputRef}
												cancelEdit={cancelEdit}
												setEditing={setEditing}
												setIsQuoteReply={setIsQuoteReply}
												setQuoteMessage={setQuoteMessage}
											/>
										</div>
										<div
											className={`flex gap-2 items-center ${
												sender.toString() === senderId.toString() ? 'flex-row' : 'flex-row-reverse'
											}`}
										>
											<div
												className={`text-[12px] ${
													status === 'failed' ? 'text-red-600' : 'text-white'
												}`}
											>
												<MessageStatus
													time={getTime(time)}
													status={status ?? 'sent'}
													iAmTheSender={sender.toString() === senderId.toString()}
													onResend={() => handleResend(id, doSend, state, app)}
												/>
											</div>
											<PreviousMessages
												id={id}
												isSender={sender.toString() === senderId.toString()}
												isEdited={isEdited}
												openPreviousEdit={openPreviousEdit}
												openPreviousMessages={openPreviousMessages}
												oldMessages={oldMessages}
											/>
										</div>
									</div>
								</div>
							);
						}
					)}
				</ScrollToBottom>
			</div>

			<MessageInput
				message={message}
				handleTypingStatus={handleTypingStatus}
				setMessage={setMessage}
				editing={editing}
				cancelEdit={cancelEdit}
				handleSubmit={handleSubmit}
				inputRef={inputRef}
			/>
		</div>
	);
};

export default Chat;
