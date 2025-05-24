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
import { connectWithId } from './socketConnection';
import { createBrowserNotification } from './browserNotification';
import { isExplicitDisconnection } from './utils';

/**
 *
 * @param {Socket} socket
 */
export default function useBuddyUtils(socket) {
	let reconnectAttempts = 0;

	async function setupSocket(currentChatId, startSearch) {
		if (!currentChatId) {
			startSearch();
		}

		if (!socket.connected) {
			try {
				await connectWithId(currentChatId);
			} catch (error) {
				console.error('Failed to connect:', error);
			}
		}
	}

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

	function disconnect(currentChatId, onDisconnected, onEndSearch) {
		if (currentChatId) {
			return;
		}

		reconnectAttempts = 0;
		socket.disconnect();
		onDisconnected();
		onEndSearch();
	}

	async function handleReconnect(
		currentChatId,
		onStartSearch,
		onSetLoadingText,
		defaultLoadingText
	) {
		if (socket.connected) {
			return;
		}

		onStartSearch();
		onSetLoadingText(defaultLoadingText);
		await connectWithId(currentChatId);
	}

	function handleReconnectClick(currentChatId, startSearch, setLoadingText, defaultLoadingText) {
		return () => handleReconnect(currentChatId, startSearch, setLoadingText, defaultLoadingText);
	}

	function handleReconnectAttempt(attempt) {
		reconnectAttempts = attempt;
	}

	function handleReconnectError(onDisconnect) {
		if (reconnectAttempts >= 3) {
			onDisconnect();
		}
	}

	function onUserJoined({ roomId, userIds }, { playNotification, createChat, endSearch }) {
		playNotification('buddyPaired');
		createBrowserNotification(
			"Let's Chat :)",
			"You've found a match, don't keep your Partner waiting ⌛"
		);
		createChat(roomId, userIds);
		endSearch(roomId);
	}

	function onRestoreChat({ chats, currentChatId }, { createChat, endSearch }) {
		Object.values(chats).forEach((chat) => {
			createChat(chat.id, chat.userIds, chat.messages, chat.createdAt);
		});
		endSearch(currentChatId);
	}

	function onConnect({ loginId, email }, { joinSearch, setDisconnected }) {
		joinSearch({
			loginId,
			email,
		});
		setDisconnected(false);
	}

	function onClose(
		chatId,
		{ endSearch, closeChat, playNotification, navigate, createBrowserNotification, startNewSearch }
	) {
		endSearch();
		closeChat(chatId);
		playNotification('chatClosed');

		if (!confirm('This chat is closed! Would you like to search for a new buddy?')) {
			navigate('/');
			return;
		}

		createBrowserNotification('Chat Closed', 'Your buddy left the chat');
		startNewSearch();
	}

	function onInactive({ closeAllChats }) {
		closeAllChats();
	}

	function onDisconnect(reason, { app, disconnect, setDisconnected, endSearch }) {
		if (isExplicitDisconnection(reason)) {
			return;
		}

		disconnect(app.currentChatId, () => setDisconnected(true), endSearch);
	}

	function setupSocketListeners({
		authState,
		playNotification,
		createChat,
		endSearch,
		closeChat,
		navigate,
		createBrowserNotification,
		startNewSearch,
		closeAllChats,
		app,
		setDisconnected,
	}) {
		const onConnectHandler = () =>
			onConnect(
				{ loginId: authState.loginId, email: authState.email },
				{ joinSearch, setDisconnected }
			);

		const onUserJoinedHandler = (data) =>
			onUserJoined(data, { playNotification, createChat, endSearch });

		const onRestoreChatHandler = (data) => onRestoreChat(data, { createChat, endSearch });

		const onCloseHandler = (chatId) =>
			onClose(chatId, {
				endSearch,
				closeChat,
				playNotification,
				navigate,
				createBrowserNotification,
				startNewSearch,
			});

		const onInactiveHandler = () => onInactive({ closeAllChats });

		const onDisconnectHandler = (reason) =>
			onDisconnect(reason, { app, disconnect, setDisconnected, endSearch });

		const reconnectErrorHandler = () => handleReconnectError(onDisconnectHandler);

		socket.on('connect', onConnectHandler);
		socket.on(NEW_EVENT_JOINED, onUserJoinedHandler);
		socket.on(NEW_EVENT_CHAT_RESTORE, onRestoreChatHandler);
		socket.on(NEW_EVENT_CLOSED, onCloseHandler);
		socket.on(NEW_EVENT_INACTIVE, onInactiveHandler);
		socket.on('disconnect', onDisconnectHandler);
		socket.io.on('reconnect_attempt', handleReconnectAttempt);
		socket.io.on('reconnect_error', reconnectErrorHandler);

		return () => {
			socket.off('connect', onConnectHandler);
			socket.off(NEW_EVENT_JOINED, onUserJoinedHandler);
			socket.off(NEW_EVENT_CHAT_RESTORE, onRestoreChatHandler);
			socket.off(NEW_EVENT_CLOSED, onCloseHandler);
			socket.off(NEW_EVENT_INACTIVE, onInactiveHandler);
			socket.off('disconnect', onDisconnectHandler);
			socket.io.off('reconnect_attempt', handleReconnectAttempt);
			socket.io.off('reconnect_error', reconnectErrorHandler);
		};
	}

	return {
		joinSearch,
		setupSocketListeners,
		disconnect,
		handleReconnect,
		handleReconnectClick,
		onUserJoined,
		onRestoreChat,
		onConnect,
		onClose,
		onInactive,
		onDisconnect,
		setupSocket,
	};
}
