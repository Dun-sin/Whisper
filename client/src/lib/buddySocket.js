/**
 * @typedef {import('socket.io-client').Socket} Socket
 */
import {
	NEW_EVENT_CHAT_RESTORE,
	NEW_EVENT_CLOSED,
	NEW_EVENT_INACTIVE,
	NEW_EVENT_JOIN,
	NEW_EVENT_JOINED,
} from '../../../constants.json';

/**
 *
 * @param {Socket} socket
 */
export default function useBuddyUtils(socket) {
	function joinSearch({ loginId, email }) {
		return new Promise((resolve, reject) => {
			if (!socket.connected) {
				reject(null);
				return;
			}

			socket.timeout(30000).emit(NEW_EVENT_JOIN, { loginId, email }, (err, response) => {
				if (err) {
					reject(err);
					return;
				}

				resolve(response);
			});
		});
	}

	function setupSocketListeners({
		onConnectHandler,
		onUserJoinedHandler,
		onRestoreChatHandler,
		onCloseHandler,
		onInactiveHandler,
		onDisconnectHandler,
		onReconnectAttemptHandler,
		onReconnectErrorHandler,
	}) {
		socket.on('connect', onConnectHandler);
		socket.on(NEW_EVENT_JOINED, onUserJoinedHandler);
		socket.on(NEW_EVENT_CHAT_RESTORE, onRestoreChatHandler);
		socket.on(NEW_EVENT_CLOSED, onCloseHandler);
		socket.on(NEW_EVENT_INACTIVE, onInactiveHandler);
		socket.on('disconnect', onDisconnectHandler);
		socket.io.on('reconnect_attempt', onReconnectAttemptHandler);
		socket.io.on('reconnect_error', onReconnectErrorHandler);

		return () => {
			socket.off('connect', onConnectHandler);
			socket.off(NEW_EVENT_JOINED, onUserJoinedHandler);
			socket.off(NEW_EVENT_CHAT_RESTORE, onRestoreChatHandler);
			socket.off(NEW_EVENT_CLOSED, onCloseHandler);
			socket.off(NEW_EVENT_INACTIVE, onInactiveHandler);
			socket.off('disconnect', onDisconnectHandler);
			socket.io.off('reconnect_attempt', onReconnectAttemptHandler);
			socket.io.off('reconnect_error', onReconnectErrorHandler);
		};
	}

	return {
		joinSearch,
		setupSocketListeners,
	};
}