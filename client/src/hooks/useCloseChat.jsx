import { NEW_EVENT_CLOSE, NEW_EVENT_JOIN } from '../../../constants.json';
import { connectWithId, socket } from 'src/lib/socketConnection';
import { useCallback, useRef, useState } from 'react';

import { useApp } from 'src/context/AppContext';
import { useAuth } from 'src/context/AuthContext';
import { useChat } from 'src/context/ChatContext';
import useCheckTimePassed from './useCheckTimePassed';
import { useDialog } from 'src/context/DialogContext';
import { useNavigate } from 'react-router-dom';

const defaultLoadingText = <p>Looking for a random buddy</p>;
const useCloseChat = () => {
	const { clearTimer } = useCheckTimePassed();
	const { app, startSearch, endSearch } = useApp();
	const { currentChatId } = app;
	const { setDialog } = useDialog();

	const navigate = useNavigate();
	const { closeChat } = useChat();
	const { authState } = useAuth();
	const [autoSearchAfterClose, setAutoSearchAfterClose] = useState(false);
	const [loadingText, setLoadingText] = useState(defaultLoadingText);

	const autoSearchRef = useRef();
	autoSearchRef.current = autoSearchAfterClose;

	const emitJoin = useCallback(() => {
		socket.volatile.emit(NEW_EVENT_JOIN, {
			loginId: authState.loginId,
			email: authState.email,
		});
	}, []);

	const startNewSearch = () => {
		startSearch();
		setLoadingText(defaultLoadingText);

		emitJoin();
	};

	const emitClose = useCallback((err, chatClosed) => {
		if (err) {
			alert('An error occured whiles closing chat.');
			setAutoSearchAfterClose(false);
			return err;
		}

		if (chatClosed) {
			closeChat(currentChatId);
		}
		endSearch();

		if (chatClosed && autoSearchRef.current) {
			startNewSearch();

			setAutoSearchAfterClose(false);
		} else {
			navigate('/');
		}

		clearTimer();
	}, []);

	const closeChatHandler = async (autoSearch = false) => {
		if (!currentChatId) {
			navigate('/');
			return;
		}

		if (!socket.connected) {
			try {
				await connectWithId(currentChatId);
			} catch (error) {
				console.error('Failed to connect:', error);
				return;
			}
		}

		setAutoSearchAfterClose(autoSearch);

		socket.timeout(30000).emit(NEW_EVENT_CLOSE, currentChatId, emitClose);
	};

	const handleClose = (autoSearch = false) => {
		setDialog({
			isOpen: true,
			text: 'Are you sure you want to close this chat?',
			handler: async () => await closeChatHandler(autoSearch),
		});
	};

	return { handleClose, startNewSearch, loadingText, setLoadingText, closeChatHandler };
};

export default useCloseChat;
