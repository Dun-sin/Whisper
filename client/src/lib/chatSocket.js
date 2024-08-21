/**
 * @typedef {import('socket.io-client').Socket} Socket
 */
import {
	NEW_EVENT_DELETE_MESSAGE,
	NEW_EVENT_EDIT_MESSAGE,
	NEW_EVENT_READ_MESSAGE,
	NEW_EVENT_SEND_MESSAGE,
	NEW_EVENT_TYPING,
} from '../../../constants.json';
import { useCallback } from 'react';
import { useApp } from 'src/context/AppContext';
/**
 *
 * @param {Socket} socket
 */
export default function useChatUtils(socket) {

	const { app } = useApp();

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

	return {
		emitTyping,
		sendMessage,
		deleteMessage,
		editMessage,
		seenMessage,
	};
}