/* eslint-disable max-len */

import { BsArrow90DegLeft, BsArrow90DegRight } from 'react-icons/bs';
import {
	NEW_EVENT_DELETE_MESSAGE,
	NEW_EVENT_EDIT_MESSAGE,
	NEW_EVENT_READ_MESSAGE,
	NEW_EVENT_RECEIVE_MESSAGE,
	NEW_EVENT_SEND_FAILED,
	NEW_EVENT_TYPING,
} from '../../../constants.json';
import chatHelper, {
	adjustTextareaHeight,
	arrayBufferToBase64,
	getTime,
	pemToArrayBuffer,
} from '../lib/chatHelper';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import BadWordsNext from 'bad-words-next';
import DropDownOptions from './Chat/DropDownOption';
import MarkdownIt from 'markdown-it';
import MessageInput from './Chat/MessageInput';
import MessageSeen from './Chat/MessageSeen';
import MessageStatus from './MessageStatus';
import PreviousMessages from './Chat/PreviousMessages';
import ScrollToBottom from 'react-scroll-to-bottom';
import { socket } from 'src/lib/socketConnection';
import { createBrowserNotification } from 'src/lib/browserNotification';
import decryptMessage from 'src/lib/decryptMessage';
import en from 'bad-words-next/data/en.json';
import { throttle } from 'lodash';
import { useApp } from 'src/context/AppContext';
import { useAuth } from 'src/context/AuthContext';
import { useChat } from 'src/context/ChatContext';
import useChatUtils from 'src/lib/chatSocket';
import useInactiveChat from 'src/hooks/useInactiveChat';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useNotification } from 'src/lib/notification';
import { v4 as uuid } from 'uuid';

import useCryptoKeys from 'src/hooks/useCryptoKeys';

let senderId;

const Chat = () => {
	const { app } = useApp();
	const { playNotification } = useNotification();
	const [editing, setEditing] = useState({
		isediting: false,
		messageID: null,
	});
	const [message, setMessage] = useState('');

	const [decryptedMessages, setDecryptedMessages] = useState();
	// use the id so we can track what message's previousMessage is open
	const [openPreviousMessages, setOpenPreviousMessages] = useState(null);
	const [badwordChoices, setBadwordChoices] = useState({});

	const {
		messages: state,
		addMessage,
		updateMessage,
		removeMessage,
		receiveMessage,
		startReply,
		currentReplyMessageId,
		cancelReply,
	} = useChat();
	const {importedPublicKey, importedPrivateKey, cryptoKey, importKey, generateKeyPair

	 } = useCryptoKeys(app.currentChatId);
	const { authState, dispatchAuth } = useAuth();
	const { logout } = useKindeAuth();

	const { sendMessage, editMessage } = useChatUtils(socket);
	const { getMessage, handleResend, scrollToMessage } = chatHelper(state, app);

	const inputRef = useRef('');
	const cryptoKeyRef = useRef(null);
	cryptoKeyRef.current = cryptoKey;

	senderId = authState.loginId;

	const md = new MarkdownIt({
		html: false,
		linkify: true,
		typographer: true,
	});

	const badwords = new BadWordsNext({ data: en });

	function logOut() {
		dispatchAuth({
			type: 'LOGOUT',
		});
		logout();
	}

	const emitTyping = useCallback((boolean) => {
		socket.timeout(5000).emit(NEW_EVENT_TYPING, { chatId: app.currentChatId, isTyping: boolean });
	}, [])

	const cancelEdit = () => {
		inputRef.current.value = '';
		setEditing({ isediting: false, messageID: null });
		emitTyping(false)
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

	const doSend = async ({ senderId, room, message, time, containsBadword, replyTo = null }) => {
		if (!cryptoKey) {
			console.error('Encryption key not generated yet.');
			return;
		}

		if (!importedPublicKey) {
			throw Error('Public Key not Generated');
		}
		// Encoding and encryting the message to be sent.
		const encoder = new TextEncoder();
		const encryptedMessagersa = await crypto.subtle.encrypt(
			{
				name: 'RSA-OAEP',
			},
			importedPublicKey,
			encoder.encode(message)
		);

		// Convert the Uint8Array to Base64 string
		const encryptedMessage = arrayBufferToBase64(new Uint8Array(encryptedMessagersa));

		try {
			const sentMessage = await sendMessage({
				senderId,
				message: encryptedMessage,
				time,
				chatId: room,
				containsBadword,
				replyTo,
			});
			addMessage({
				senderId,
				room,
				id: sentMessage.id,
				message: encryptedMessage,
				time,
				status: 'pending',
				containsBadword,
				replyTo,
			});

			try {
				updateMessage(sentMessage);
			} catch {
				logOut();
				return false;
			}
		} catch (e) {
			try {
				updateMessage({
					senderId,
					room,
					id: uuid(),
					message: encryptedMessage,
					time,
					status: 'failed',
					containsBadword,
					replyTo,
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

		emitTyping(false)
		const d = new Date();
		const message = inputRef.current.value.trim(); // Trim the message to remove the extra spaces

		if (message === '' || senderId === undefined || senderId === '123456') {
			return;
		}

		if (editing.isediting === true) {
			try {
				const messageObject = getMessage(editing.messageID, state, app);
				const oldMessage = messageObject.message;
				const editedMessage = await editMessage({
					id: editing.messageID,
					chatId: app.currentChatId,
					newMessage: message,
					oldMessage,
				});

				updateMessage({ ...editedMessage, room: app.currentChatId }, true);
			} catch (e) {
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
				containsBadword: badwords.check(message),
				replyTo: currentReplyMessageId,
			});
		}

		if (inputRef.current) {
			inputRef.current.value = '';
			setMessage('');
			inputRef.current.focus();
		}
		cancelReply();
	};

	const handleTypingStatus = throttle((e) => {
		if (e.target.value.length > 0) {
			emitTyping(true)
		}
		setMessage(e.target.value);
		adjustTextareaHeight(inputRef);
		e.target.style.height = '48px';
		e.target.style.height = `${e.target.scrollHeight}px`;
	}, 500);

	const openPreviousEdit = (messageId) => {
		if (openPreviousMessages === messageId) {
			setOpenPreviousMessages(null);
		} else {
			setOpenPreviousMessages(messageId);
		}
	};

	const hideBadword = (id) => {
		setBadwordChoices({ ...badwordChoices, [id]: 'hide' });
	};

	const showBadword = (id) => {
		setBadwordChoices({ ...badwordChoices, [id]: 'show' });
	};

	const onNewMessageHandler = useCallback(async (message) => {
		try {
			const decryptedMessage = await decryptMessage(message.message, cryptoKeyRef.current);
			addMessage(message);
			playNotification('newMessage');
			createBrowserNotification('You received a new message on Whisper', decryptedMessage);
		} catch (error) {
			console.error(`Could not decrypt message: ${error.message}`, error);
		}
	}, [cryptoKey]);

	const onDeleteMessageHandler = useCallback(({ id, chatId }) => {
		removeMessage(id, chatId);
	}, []);

	const onEditMessageHandler = useCallback((messageEdited) => {
		updateMessage({ ...messageEdited, room: app.currentChatId }, true);
	}, []);

	const onLimitMessageHandler = useCallback((data) => {
		alert(data.message);
	}, []);

	const onReadMessageHandler = useCallback(({ messageId, chatId }) => {
		receiveMessage(messageId, chatId);
	}, []);

	const onPublicStringHandler = useCallback(({ pemPublicKeyString, pemPrivateKeyString }) => {
		const pemPublicKeyArrayBuffer = pemToArrayBuffer(pemPublicKeyString);
		const pemPrivateKeyArrayBuffer = pemToArrayBuffer(pemPrivateKeyString);
		
		// Import PEM-formatted public key as CryptoKey
		importKey(pemPublicKeyArrayBuffer, pemPrivateKeyArrayBuffer);
	}, []);

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

	// this is used to send the notification for inactive chat to the respective user
	// get the last message sent
	const getLastMessage = sortedMessages.at(-1);

	const amITheSender = getLastMessage && getLastMessage.senderId === senderId;

	// pass it to the hook
	useInactiveChat(getLastMessage, amITheSender);
	useEffect(() => {
		inputRef.current.focus();
	}, [currentReplyMessageId]);

	useEffect(() => {
	const fetchData = async () => {
		const decryptedPromises = sortedMessages.map(
			async ({ message, senderId: sender, ...rest }) => {
				try {
					if (sender.toString() === senderId.toString()) {
						const decryptedMessage = await decryptMessage(message, importedPrivateKey);
						return {
							...rest,
							senderId: senderId,
							message: decryptedMessage,
						};
					}

					const finalMessage = await decryptMessage(message, cryptoKey);
					return {
						...rest,
						senderId: sender,
						message: finalMessage || message, // Use the decrypted message, or fallback to the original message
					};
				} catch (error) {
					console.error('Decryption error:', error);
					return {
						...rest,
						senderId: sender,
						message: message, // Use the original message in case of decryption error
					};
				}
			}
		);

		const decryptedMessages = await Promise.all(decryptedPromises);
		setDecryptedMessages(decryptedMessages);
	};

	fetchData();
}, [sortedMessages, cryptoKey]);

	useEffect(() => {
		generateKeyPair()
		socket.on('publicKey', onPublicStringHandler);
		socket.on(NEW_EVENT_RECEIVE_MESSAGE, onNewMessageHandler);
		socket.on(NEW_EVENT_DELETE_MESSAGE, onDeleteMessageHandler);
		socket.on(NEW_EVENT_EDIT_MESSAGE, onEditMessageHandler);
		socket.on(NEW_EVENT_READ_MESSAGE, onReadMessageHandler);
		socket.on(NEW_EVENT_SEND_FAILED, onLimitMessageHandler);

		return () => {
			socket.off(NEW_EVENT_RECEIVE_MESSAGE, onNewMessageHandler);
			socket.off(NEW_EVENT_DELETE_MESSAGE, onDeleteMessageHandler);
			socket.off(NEW_EVENT_EDIT_MESSAGE, onEditMessageHandler);
			socket.off(NEW_EVENT_READ_MESSAGE, onReadMessageHandler);
			socket.off(NEW_EVENT_SEND_FAILED, onLimitMessageHandler);
			socket.off('publicKey', onPublicStringHandler);
		};
	}, []);

	return (
		<div className="w-full md:h-[90%] min-h-[100%] pb-[25px] flex flex-col justify-between gap-6">
			<div className="max-h-[67vh]">
				<p className="text-[0.8em] font-semibold mb-[10px] mt-[20px] text-center">
					Connected with a random User
					{sortedMessages.length === 0 && ', Be the first to send {"Hello"}'}
				</p>
				<ScrollToBottom
					initialScrollBehavior="auto"
					className="h-[100%] md:max-h-full overflow-y-auto w-full scroll-smooth"
				>
					{decryptedMessages &&
						decryptedMessages.map(
							({
								senderId: sender,
								id,
								message,
								time,
								status,
								isEdited,
								oldMessages,
								containsBadword,
								isRead,
								replyTo,
							}) => {
								const isSender = sender.toString() === senderId.toString();
								// original message this message is a reply to
								const repliedMessage = replyTo
									? (() => {
											const messageObj = getMessage(replyTo);
											if (!messageObj) {
												return null;
											}

											return {
												...messageObj,
											};
									  })()
									: null;

								// is this message currently being replied?
								const hasActiveReply = currentReplyMessageId === id;

								return (
									<div
										key={id}
										id={`message-${id}`}
										className={`
								flex flex-col gap-2 py-2 duration-500 transition-all
									${hasActiveReply ? 'bg-[#FF9F1C]/25 border-[#FF9F1C]' : ''},
									${hasActiveReply ? (isSender ? 'border-r-[3.5px]' : 'border-l-[3.5px]') : ''}`}
									>
										{replyTo && (
											<div
												className={`
										max-w-[80%] md:max-w-[50%] min-w-[10px] flex gap-2 items-center
											${sender.toString() === senderId.toString() ? 'self-end' : ''}
											${repliedMessage ? 'cursor-pointer' : ''}
										`}
												onClick={() => scrollToMessage(replyTo)}
											>
												<div className="truncate border-b-4 border-[#FF9F1C] p-1">
													{repliedMessage ? (
														typeof repliedMessage.message === 'string' ? (
															<div
																className="message-reply-container flex flex-nowrap items-center gap-2"
																dangerouslySetInnerHTML={{
																	__html: md.render(repliedMessage.message),
																}}
															/>
														) : (
															repliedMessage.message
														)
													) : (
														<p className="text-gray-400 uppercase text-sm italic">
															Original Message Deleted
														</p>
													)}
												</div>
												<div
													className={sender.toString() !== senderId.toString() ? 'order-first' : ''}
												>
													{sender.toString() === senderId.toString() ? (
														<BsArrow90DegLeft className="fill-white text-2xl" />
													) : (
														<BsArrow90DegRight className="fill-white text-2xl" />
													)}
												</div>
											</div>
										)}
										<div
											className={`w-full flex text-white relative mb-2 ${
												isSender ? 'justify-end' : 'justify-start'
											}`}
										>
											<div
												className={`flex flex-col mb-[2px] min-w-[10px] mdl:max-w-[80%] max-w-[50%] ${
													isSender ? 'items-end' : 'items-start'
												}`}
											>
												{containsBadword && !isSender && !badwordChoices[id] ? (
													<div className="flex flex-col border-red border w-full rounded-r-md p-3">
														<p>Your buddy is trying to send you a bad word</p>
														<div className="flex w-full gap-6">
															<span
																onClick={() => showBadword(id)}
																className="text-sm cursor-pointer"
															>
																See
															</span>
															<span
																onClick={() => hideBadword(id)}
																className="text-red text-sm cursor-pointer"
															>
																Hide
															</span>
														</div>
													</div>
												) : (
													<>
														<div
															className={`chat bg-red p-3 break-all will-change-auto flex gap-6 items-center text ${
																isSender
																	? 'justify-between bg-secondary rounded-l-md'
																	: 'rounded-r-md'
															}`}
														>
															{typeof message === 'string' ? (
																<span
																	dangerouslySetInnerHTML={{
																		__html: md.render(
																			badwordChoices[id] === 'hide'
																				? badwords.filter(message)
																				: badwordChoices[id] === 'show'
																				? message
																				: message
																		),
																	}}
																/>
															) : badwordChoices[id] === 'hide' ? (
																badwords.filter(message)
															) : badwordChoices[id] === 'show' ? (
																message
															) : (
																message
															)}

															<DropDownOptions
																isSender={isSender && status !== 'pending'}
																id={id}
																inputRef={inputRef}
																cancelEdit={cancelEdit}
																setEditing={setEditing}
																setReplyId={startReply}
																cryptoKey={cryptoKey}
																importedPrivateKey={importedPrivateKey}
															/>
														</div>
														<div
															className={`flex gap-2 items-center ${
																isSender ? 'flex-row' : 'flex-row-reverse'
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
																	iAmTheSender={isSender}
																	onResend={() => handleResend(id, doSend, state, app)}
																/>
															</div>
															<PreviousMessages
																id={id}
																isSender={isSender}
																isEdited={isEdited}
																openPreviousEdit={openPreviousEdit}
																openPreviousMessages={openPreviousMessages}
																oldMessages={oldMessages}
															/>
														</div>
														<MessageSeen isRead={isRead} isSender={isSender} />
													</>
												)}
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
