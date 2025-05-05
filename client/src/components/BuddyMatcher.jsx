import { useNavigate } from 'react-router-dom';
import { connectWithId, socket } from 'src/lib/socketConnection';
import useBuddyUtils from 'src/lib/buddySocket';
import { useCallback, useEffect, useState } from 'react';
import Anonymous from 'components/Anonymous';
import { createBrowserNotification } from 'src/lib/browserNotification';
import { isExplicitDisconnection } from 'src/lib/utils';
import { useApp } from 'src/context/AppContext';
import { useAuth } from 'src/context/AuthContext';
import { useChat } from 'src/context/ChatContext';
import useCloseChat from 'src/hooks/useCloseChat';
import { useNotification } from 'src/lib/notification';
import ReconnectBanner from './ReconnectBanner';

const defaultLoadingText = <p>Looking for a random buddy</p>;

const BuddyMatcher = () => {
	const { playNotification } = useNotification();
	const navigate = useNavigate();
	const { authState } = useAuth();
	const { createChat, closeChat, closeAllChats } = useChat();
	const { startSearch, endSearch, app } = useApp();
	const { setLoadingText, startNewSearch } = useCloseChat();
	const { joinSearch, setupSocketListeners, disconnect, handleReconnect } = useBuddyUtils(socket);

	const [disconnected, setDisconnected] = useState(false);

	const onUserJoined = useCallback(({ roomId, userIds }) => {
		playNotification('buddyPaired');
		createBrowserNotification(
			"Let's Chat :)",
			"You've found a match, don't keep your Partner waiting ⌛"
		);
		createChat(roomId, userIds);
		endSearch(roomId);
	}, []);

	const onRestoreChat = useCallback(({ chats, currentChatId }) => {
		Object.values(chats).forEach((chat) => {
			createChat(chat.id, chat.userIds, chat.messages, chat.createdAt);
		});
		endSearch(currentChatId);
	}, []);

	const onConnect = useCallback(() => {
		joinSearch({
			loginId: authState.loginId,
			email: authState.email,
		});
		setDisconnected(false);
	}, []);

	const onClose = useCallback((chatId) => {
		endSearch();
		closeChat(chatId);
		playNotification('chatClosed');

		if (!confirm('This chat is closed! Would you like to search for a new buddy?')) {
			navigate('/');
			return;
		}

		createBrowserNotification('Chat Closed', 'Your buddy left the chat');
		startNewSearch();
	}, []);

	const onInactive = useCallback(() => {
		closeAllChats();
	}, []);

	const onDisconnect = useCallback((reason) => {
		if (isExplicitDisconnection(reason)) {
			return;
		}

		disconnect(app.currentChatId, () => setDisconnected(true), endSearch);
	}, []);

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
		const cleanupListeners = setupSocketListeners({
			onConnectHandler: onConnect,
			onUserJoinedHandler: onUserJoined,
			onRestoreChatHandler: onRestoreChat,
			onCloseHandler: onClose,
			onInactiveHandler: onInactive,
			onDisconnectHandler: onDisconnect,
		});

		return () => {
			cleanupListeners();
			socket.disconnect();
		};
	}, [app.currentChatId]);

	if (app.isSearching || !app.currentChatId) {
		navigate('/searching');
	}

	const handleReconnectClick = useCallback(() => {
		handleReconnect(app.currentChatId, startSearch, setLoadingText, defaultLoadingText);
	}, [app.currentChatId, startSearch, setLoadingText]);

	const reconnectBanner = <ReconnectBanner handleReconnect={handleReconnectClick} />;
	return disconnected ? reconnectBanner : <Anonymous />;
};

export default BuddyMatcher;
