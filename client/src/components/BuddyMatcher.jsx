import { Link, useNavigate } from 'react-router-dom';
import {
	NEW_EVENT_CHAT_RESTORE,
  NEW_EVENT_CLOSED,
	NEW_EVENT_INACTIVE,
	NEW_EVENT_JOIN,
	NEW_EVENT_JOINED,
	NEW_EVENT_STOP_SEARCH,
	NEW_EVENT_STOP_SEARCH_SUCCESS,
} from '../../../constants.json';
import { connectWithId, socket } from 'src/lib/socketConnection';
import { useCallback, useEffect, useRef, useState } from 'react';

import Anonymous from 'components/Anonymous';
import { PiPlugsLight } from 'react-icons/pi';
import { ThreeDots } from 'react-loading-icons';
import { createBrowserNotification } from 'src/lib/browserNotification';
import { isExplicitDisconnection } from 'src/lib/utils';
import { useApp } from 'src/context/AppContext';
import { useAuth } from 'src/context/AuthContext';
import { useChat } from 'src/context/ChatContext';
import useCloseChat from 'src/hooks/useCloseChat';
import { useNotification } from 'src/lib/notification';

const stoppingSearchLoadingText = <p>Stopping the search</p>;
const defaultLoadingText = <p>Looking for a random buddy</p>;

const BuddyMatcher = () => {
	const { playNotification } = useNotification();
	const navigate = useNavigate();
	const { authState } = useAuth();
	const { createChat, closeChat, closeAllChats } = useChat();
  const { startSearch, endSearch, app } = useApp();
  const {
    setLoadingText,
    startNewSearch,
    loadingText
  } = useCloseChat()

	const [disconnected, setDisconnected] = useState(false);
	const reconnectAttempts = useRef(0);

	const [isStoppingSearch, setIsStoppingSearch] = useState(false);


	let timeout = null;

	function disconnect() {
		reconnectAttempts.current = 0;
		if (app.currentChatId) {
			return;
		}

		socket.disconnect();
		setDisconnected(true);
		endSearch();
	}



  const emitStopSearch = useCallback(() => {
		socket.emit(NEW_EVENT_STOP_SEARCH, {
			loginId: authState.loginId,
			email: authState.email,
		});
	}, [])

    ;

	const handleStopSearch = () => {
		emitStopSearch()
		setIsStoppingSearch(true);
	};

  async function handleReconnect() {
		if (socket.connected) {
			return;
		}

		startSearch();
		setLoadingText(defaultLoadingText);
    await connectWithId(app.currentChatId)
	}
	
  const onUserJoined = useCallback(({ roomId, userIds }) => {
		playNotification('buddyPaired');
		createBrowserNotification(
			"Let's Chat :)",
			"You've found a match, don't keep your Partner waiting ⌛"
		);
		createChat(roomId, userIds);
		endSearch(roomId);
	}, [])

	const onRestoreChat = useCallback(({ chats, currentChatId }) => {
		Object.values(chats).forEach((chat) => {
			createChat(chat.id, chat.userIds, chat.messages, chat.createdAt);
		});
		endSearch(currentChatId);
	}, [])

	const onStopSearch = useCallback( () => {
		setIsStoppingSearch(false);
		endSearch();
		navigate('/');
	}, [])

	const onConnect = useCallback(() => {
		// Here server will be informed that user is searching for
    // another user
		socket.emit(NEW_EVENT_JOIN, {
			loginId: authState.loginId,
			email: authState.email,
		});
		setDisconnected(false);
	}, [])

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
	}, [])

	const onInactive = useCallback(() => {
		closeAllChats();
	}, [])

  const onDisconnect = useCallback((reason) => {
		if (isExplicitDisconnection(reason)) {
			return;
		}

		disconnect();
	}, [])

	const onReconnectAttempt = useCallback((attempts) => {
		reconnectAttempts.current = attempts;
	}, [])

	const onReconnectError = useCallback(() => {
		if (reconnectAttempts.current >= 3) {
			disconnect();
		}
	}, [])


	
	useEffect(() => {
		setLoadingText(isStoppingSearch ? stoppingSearchLoadingText : defaultLoadingText);
	}, [isStoppingSearch]);

	useEffect(() => {
		if (loadingText === defaultLoadingText) {
			timeout = setTimeout(() => {
				setLoadingText(
					<>
						<p>
							Taking too long? <br className="md:hidden" />
							No <span className="hidden sm:inline">chat</span> buddy is currently available :({' '}
						</p>
						<p>
							<a
								href="https://ctt.ac/US0h0"
								target="_blank"
								rel="noreferrer"
								className="text-blue-500 underline"
							>
								Tweet
							</a>{' '}
							about this app and get more people to use it!
						</p>
					</>
				);
			}, 15000);
		}

		return () => {
			clearTimeout(timeout);
		};
	}, [loadingText]);

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

    socket.on('connect', onConnect);
    socket.on(NEW_EVENT_CLOSED, onClose);
    socket.on(NEW_EVENT_JOINED, onUserJoined);
    socket.on(NEW_EVENT_CHAT_RESTORE, onRestoreChat);
    socket.on(NEW_EVENT_INACTIVE, onInactive);
    socket.on(NEW_EVENT_STOP_SEARCH_SUCCESS, onStopSearch);
    socket.on('disconnect', onDisconnect);
    socket.io.on('reconnect_attempt', onReconnectAttempt);
    socket.io.on('reconnect_error', onReconnectError);

    return () => {
      socket
        .off('connect', onConnect)
        .off(NEW_EVENT_JOINED, onUserJoined)
        .off(NEW_EVENT_CHAT_RESTORE, onRestoreChat)
        .off(NEW_EVENT_CLOSED, onClose)
        .off(NEW_EVENT_INACTIVE, onInactive)
        .off('disconnect', onDisconnect);

      socket.io
        .off('reconnect_attempt', onReconnectAttempt)
        .off('reconnect_error', onReconnectError);

      socket.disconnect();
    };
  }, [app.currentChatId]);

	return app.isSearching || !app.currentChatId ? (
		<div className="flex w-full justify-center items-center min-h-[calc(100vh-70px)] flex-col bg-light dark:bg-primary">
			<ThreeDots fill="rgb(255 159 28)" />
			<div className="text-lg text-center text-primary dark:text-white">{loadingText}</div>
			{!isStoppingSearch && (
				<button
					onClick={handleStopSearch}
					className={
						'hover:no-underline hover:text-white font-medium text-white text-[1.5em] w-[8em] h-[2.3em] mt-4 rounded-[30px] bg-[#FF3A46] flex flex-col items-center justify-center'
					}
				>
					Stop
				</button>
			)}
		</div>
	) : disconnected ? (
		<div className="flex flex-col w-full justify-center items-center h-full bg-primary">
			<PiPlugsLight className="text-secondary text-8xl" />
			<p className="text-lg text-center text-white">Sorry, it seems you&apos;re not connected</p>
			<div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-[1.5em] mt-4 font-medium items-center">
				<button
					onClick={handleReconnect}
					className={
						'hover:no-underline hover:text-black text-black w-[8em] h-[2.3em] rounded-[30px] bg-[#FF9F1C] flex flex-col items-center justify-center'
					}
				>
					Try again
				</button>
				<Link to="/" className="underline text-white hover:text-white text-lg">
					Return Home
				</Link>
			</div>
		</div>
	) : (
        <Anonymous />
	);
};

export default BuddyMatcher;
