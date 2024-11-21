/* eslint-disable max-len */

import chatHelper, {
	adjustTextareaHeight,
	arrayBufferToBase64,
	pemToArrayBuffer,
} from '../lib/chatHelper';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import BadWordsNext from 'bad-words-next';
import Loading from './Loading';
import MessageInput from './Chat/MessageInput';
import MessageList from './Chat/MessageList';
import ScrollToBottom from 'react-scroll-to-bottom';
import { createBrowserNotification } from 'src/lib/browserNotification';
import decryptMessage from 'src/lib/decryptMessage';
import en from 'bad-words-next/data/en.json';
import { socket } from 'src/lib/socketConnection';
import { throttle } from 'lodash';
import { useApp } from 'src/context/AppContext';
import { useAuth } from 'src/context/AuthContext';
import { useChat } from 'src/context/ChatContext';
import useChatUtils from 'src/lib/chatSocket';
import useCryptoKeys from 'src/hooks/useCryptoKeys';
import useInactiveChat from 'src/hooks/useInactiveChat';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useNotification } from 'src/lib/notification';
import { v4 as uuid } from 'uuid';

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

	const {
		messages: state,
		addMessage,
		updateMessage,
		removeMessage,
		receiveMessage,
		currentReplyMessageId,
		cancelReply,
	} = useChat();
	const {
		importedPublicKey,
		importedPrivateKey,
		cryptoKey,
		messageIsDecrypting,
		generateKeyPair,
		importKey,
	} = useCryptoKeys(app.currentChatId);
	const { authState, dispatchAuth } = useAuth();
	const { logout } = useKindeAuth();

	const { sendMessage, editMessage, emitTyping, setupSocketListeners } = useChatUtils(socket);
	const { getMessage } = chatHelper(state, app);

	const inputRef = useRef('');
	const cryptoKeyRef = useRef(null);
	cryptoKeyRef.current = cryptoKey;

	senderId = authState.loginId;

	const badwords = new BadWordsNext({ data: en });

	function logOut() {
		dispatchAuth({
			type: 'LOGOUT',
		});
		logout();
	}

	const cancelEdit = () => {
		inputRef.current.value = '';
		setEditing({ isediting: false, messageID: null });
		emitTyping({ chatId: app.currentChatId, isTyping: false });
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

		emitTyping({ chatId: app.currentChatId, isTyping: false });
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
			emitTyping({ chatId: app.currentChatId, isTyping: true });
		}
		setMessage(e.target.value);
		adjustTextareaHeight(inputRef);
		e.target.style.height = '48px';
		e.target.style.height = `${e.target.scrollHeight}px`;
	}, 500);

	const onNewMessageHandler = useCallback(
		async (message) => {
			try {
				const decryptedMessage = await decryptMessage(message.message, cryptoKeyRef.current);
				addMessage(message);
				playNotification('newMessage');
				createBrowserNotification('You received a new message on Whisper', decryptedMessage);
			} catch (error) {
				console.error(`Could not decrypt message: ${error.message}`, error);
			}
		},
		[cryptoKey]
	);

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
		const fetchData = async (importedPrivateKey, cryptoKey) => {
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

		if (cryptoKey && importedPrivateKey) {
			fetchData(importedPrivateKey, cryptoKey);
		}
	}, [sortedMessages, cryptoKey, importedPrivateKey]);

	useEffect(() => {
		generateKeyPair();
		const cleanupListeners = setupSocketListeners({
			onNewMessageHandler,
			onDeleteMessageHandler,
			onEditMessageHandler,
			onReadMessageHandler,
			onLimitMessageHandler,
			onPublicStringHandler,
		});

		return cleanupListeners;
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
					{!messageIsDecrypting ? (
						<MessageList
							decryptedMessages={decryptedMessages}
							senderId={senderId}
							currentReplyMessageId={currentReplyMessageId}
							doSend={doSend}
							inputRef={inputRef}
							cancelEdit={cancelEdit}
							setEditing={setEditing}
						/>
					) : (
						<div className="w-full h-full flex flex-col items-center justify-center">
							<Loading loading={messageIsDecrypting} />
						</div>
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
