import { useNavigate } from 'react-router-dom';
import Anonymous from 'components/Anonymous';
import { useApp } from 'src/context/AppContext';
import { useAuth } from 'src/context/AuthContext';
import { useChat } from 'src/context/ChatContext';
import useCloseChat from 'src/hooks/useCloseChat';
import ReconnectBanner from './ReconnectBanner';
import { useBuddySocket } from 'src/lib/buddySocket';


const BuddyMatcher = () => {
	const navigate = useNavigate();
	const { authState } = useAuth();
	const { createChat, closeChat, closeAllChats } = useChat();
	const { startSearch, endSearch, app } = useApp();
	const { setLoadingText, startNewSearch } = useCloseChat();
	
	const { disconnected,handleReconnect } = useBuddySocket({
		authState,
		createChat,
		closeChat,
		closeAllChats,
		startSearch,
		endSearch,
		app,
		setLoadingText,
		startNewSearch
	});

	if (app.isSearching || !app.currentChatId) {
		navigate('/searching');
	}

	return disconnected ? <ReconnectBanner handleReconnect={handleReconnect} /> : <Anonymous />;
};

export default BuddyMatcher;