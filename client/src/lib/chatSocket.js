/**
 * @typedef {import('socket.io-client').Socket} Socket
 */
import { pemToArrayBuffer } from '../lib/chatHelper';
import { useCallback } from 'react';
import { createBrowserNotification } from 'src/lib/browserNotification';
import { useNotification } from 'src/lib/notification';
import { useChat } from 'src/context/ChatContext';
import useCryptoKeys from 'src/hooks/useCryptoKeys';
import { useApp } from 'src/context/AppContext';
import decryptMessage from 'src/lib/decryptMessage';
import {
	NEW_EVENT_DELETE_MESSAGE,
	NEW_EVENT_EDIT_MESSAGE,
	NEW_EVENT_READ_MESSAGE,
	NEW_EVENT_SEND_MESSAGE,
	NEW_EVENT_RECEIVE_MESSAGE,
	NEW_EVENT_SEND_FAILED,
	NEW_EVENT_TYPING,
} from '../../../constants.json';
import { useCallback } from 'react';
import { useApp } from 'src/context/AppContext';
/**
 *
 * @param {Socket} socket
 */
export default function useChatUtils(socket) {

	const { playNotification } = useNotification();
	const { app } = useApp();

	const {
		addMessage,
		updateMessage,
		removeMessage,
		receiveMessage,
	} = useChat();

	const {
		cryptoKey,
		generateKeyPair,
		importKey,
	} = useCryptoKeys(app.currentChatId);

    const cryptoKeyRef = useRef(null);
	cryptoKeyRef.current = cryptoKey;

	function sendMessage(message) {
		return new Promise((resolve, reject) => {
			if (!socket.connected) {
				reject(null);
				return;
			}

			socket.timeout(30000).emit(NEW_EVENT_SEND_MESSAGE, message, (err, sentMessage) => {
				if (err) {
					reject(err);
					return;
				}

				resolve(sentMessage);
			});
		});
	}

	function deleteMessage({ id, chatId }) {
		return new Promise((resolve, reject) => {
			if (!socket.connected) {
				reject(null);
				return;
			}

			socket
				.timeout(30000)
				.emit(NEW_EVENT_DELETE_MESSAGE, { id, chatId }, (err, messageDeleted) => {
					if (err) {
						reject(err);
						return;
					}

					resolve(messageDeleted);
				});
		});
	}

	function editMessage({ id, chatId, newMessage, oldMessage, isEdited }) {
		return new Promise((resolve, reject) => {
			if (!socket.connected) {
				reject(null);
				return;
			}

			socket
				.timeout(30000)
				.emit(
					NEW_EVENT_EDIT_MESSAGE,
					{ id, chatId, newMessage, oldMessage, isEdited },
					(err, messageEdited) => {
						if (err) {
							reject(err);
							return;
						}

						resolve(messageEdited);
					}
				);
		});
	}

	function seenMessage({ messageId, chatId }) {
		return new Promise((resolve, reject) => {
			if (!socket.connected) {
				reject(null);
				return;
			}

			socket
				.timeout(30000)
				.emit(NEW_EVENT_READ_MESSAGE, { messageId, chatId }, (err, messagedRead) => {
					if (err) {
						reject(err);
						return;
					}

					resolve(messagedRead);
				});
		});
	}
		
	const emitTyping = useCallback((boolean) => {
			socket.timeout(5000).emit(NEW_EVENT_TYPING, { chatId: app.currentChatId, isTyping: boolean });
		}, []);

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


	const deploySocketEvents = () => {
		generateKeyPair();

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
	}

	return {
		deploySocketEvents,
		emitTyping,
		sendMessage,
		deleteMessage,
		editMessage,
		seenMessage,
	};
}