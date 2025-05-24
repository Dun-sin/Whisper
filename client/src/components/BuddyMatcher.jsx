import { useNavigate } from 'react-router-dom';
import { socket } from 'src/lib/socketConnection';
import useBuddyUtils from 'src/lib/buddySocket';
import { useEffect, useState } from 'react';
import Anonymous from 'components/Anonymous';
import { createBrowserNotification } from 'src/lib/browserNotification';
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
	const { setupSocketListeners, handleReconnectClick, setupSocket } = useBuddyUtils(socket);

	const [disconnected, setDisconnected] = useState(false);

	useEffect(() => {
		setupSocket(app.currentChatId, startSearch);
		const cleanupListeners = setupSocketListeners({
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
		});

		return () => {
			cleanupListeners();
			socket.disconnect();
		};
	}, [app.currentChatId]);

	if (app.isSearching || !app.currentChatId) {
		navigate('/searching');
	}

	const reconnectBanner = (
		<ReconnectBanner
			handleReconnect={handleReconnectClick(
				app.currentChatId,
				startSearch,
				setLoadingText,
				defaultLoadingText
			)}
		/>
	);
	return disconnected ? reconnectBanner : <Anonymous />;
};

export default BuddyMatcher;
