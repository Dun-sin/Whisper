/**
 * @typedef {import('socket.io-client').Socket} Socket
 */
import {
	NEW_EVENT_DELETE_MESSAGE,
	NEW_EVENT_EDIT_MESSAGE,
	NEW_EVENT_SEND_MESSAGE,
	NEW_EVENT_READ_MESSAGE,
	NEW_EVENT_TYPING,
	NEW_EVENT_RECEIVE_MESSAGE,
	NEW_EVENT_SEND_FAILED,
} from '../../../constants.json';

/**
 *
 * @param {Socket} socket
 */
export default function useChatUtils(socket) {
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

	function emitTyping({ chatId, isTyping }) {
		return new Promise((resolve, reject) => {
			if (!socket.connected) {
				reject(null);
				return;
			}
			socket
				.timeout(30000)
				.emit(NEW_EVENT_TYPING, { chatId, isTyping }, (err, typingStatus) => {
					if (err) {
						reject(err);
						return;
					}

					resolve(typingStatus);
			});
		});
	}

	function setupSocketListeners({
		onNewMessageHandler,
		onDeleteMessageHandler,
		onEditMessageHandler,
		onReadMessageHandler,
		onLimitMessageHandler,
		onPublicStringHandler,
	}) {
		socket.on(NEW_EVENT_RECEIVE_MESSAGE, onNewMessageHandler);
		socket.on(NEW_EVENT_DELETE_MESSAGE, onDeleteMessageHandler);
		socket.on(NEW_EVENT_EDIT_MESSAGE, onEditMessageHandler);
		socket.on(NEW_EVENT_READ_MESSAGE, onReadMessageHandler);
		socket.on(NEW_EVENT_SEND_FAILED, onLimitMessageHandler);
		socket.on('publicKey', onPublicStringHandler);

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
		sendMessage,
		deleteMessage,
		editMessage,
		seenMessage,
		emitTyping,
		setupSocketListeners,
	};
}
