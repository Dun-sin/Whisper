import { useState, useContext, useEffect } from 'react';
import { ThreeDots } from 'react-loading-icons';
import { SocketContext } from 'context/Context';

import Anonymous from 'components/Anonymous';
import { useAuth } from 'src/context/AuthContext';
import { useChat } from 'src/context/ChatContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from 'src/lib/notification';
import { useApp } from 'src/context/AppContext';
import { NEW_EVENT_ADDING, NEW_EVENT_CHAT_RESTORE, NEW_EVENT_CLOSE, NEW_EVENT_CREATE_ROOM, NEW_EVENT_INACTIVE, NEW_EVENT_JOIN, NEW_EVENT_JOINED, NEW_EVENT_STOP_SEARCH, NEW_EVENT_STOP_SEARCH_SUCCESS } from '../../constants';

const stoppingSearchLoadingText = <p>Stopping the search</p>;
const BuddyMatcher = () => {
    const { playNotification } = useNotification();
    const navigate = useNavigate();
    const { authState } = useAuth();
    const { createChat, closeChat, closeAllChats } = useChat();
    const { startSearch, endSearch, app } = useApp();

    const [isStoppingSearch, setIsStoppingSearch] = useState(false);
    const socket = useContext(SocketContext);

    const userID = authState.loginId;
    const defaultLoadingText = <p>Looking for a random buddy</p>;
    const [loadingText, setLoadingText] = useState(defaultLoadingText);
    let timeout = null;

    const startNewSearch = () => {
        startSearch();
        setLoadingText(defaultLoadingText);
        socket.emit(NEW_EVENT_JOIN, { loginId: authState.loginId, email: authState.email });
    };

    const handleStopSearch = () => {
        socket.emit(NEW_EVENT_STOP_SEARCH, {
            loginId: authState.loginId,
            email: authState.email,
        });
        setIsStoppingSearch(true);
    };

    useEffect(() => {

        setLoadingText(
            isStoppingSearch ? stoppingSearchLoadingText : defaultLoadingText
        );
    }, [isStoppingSearch]);

    useEffect(() => {
        if (loadingText === defaultLoadingText) {
            timeout = setTimeout(() => {
                setLoadingText(
                    <>
                        <p>
                            Taking too long? <br className="md:hidden" />
                            No <span className="hidden sm:inline">
                                chat
                            </span>{' '}
                            buddy is currently available :({' '}
                        </p>
                        <p>
                            <a
                                href="https://ctt.ac/US0h0"
                                target="_blank"
                                rel="noreferrer"
                                className='text-blue-500 underline'
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
        if (!app.currentChatId) {
            startSearch();
        }

        if (!socket.connected) {
            socket.connect();
        }

        socket.on(NEW_EVENT_CLOSE, (chatId) => {
            endSearch();
            closeChat(chatId);
            playNotification('chatClosed');

            if (
                !confirm(
                    'This chat is closed! Would you like to search for a new buddy?'
                )
            ) {
                navigate('/');
                return;
            }

            startNewSearch();
        });

        // This is necessary else chat won't be restored after re-connections
        socket.on('connect', () => {
            // Here server will be informed that user is searching for
            // another user
            socket.emit(NEW_EVENT_JOIN, { loginId: authState.loginId, email: authState.email });
        });
        socket.connected && socket.emit(NEW_EVENT_ADDING, { userID });
        socket.emit(NEW_EVENT_CREATE_ROOM, `${userID}-in-search`);
        // From here will get the info from server that user has joined the room

        socket.on(NEW_EVENT_JOINED, ({ roomId, userIds }) => {
            playNotification('buddyPaired');

            createChat(roomId, userIds);
            endSearch(roomId);
        });

        socket.on(NEW_EVENT_CHAT_RESTORE, ({ chats, currentChatId }) => {
            Object.values(chats).forEach((chat) => {
                createChat(
                    chat.id,
                    chat.userIds,
                    chat.messages,
                    chat.createdAt
                );
            });
            endSearch(currentChatId);
        });

        socket.on(NEW_EVENT_INACTIVE, () => {
            closeAllChats();
        });

        socket.on(NEW_EVENT_STOP_SEARCH_SUCCESS, () => {
            setIsStoppingSearch(false);
            endSearch();
            navigate('/');
        });

        return () => {
            socket
                .off('connect')
                .off(NEW_EVENT_JOINED)
                .off(NEW_EVENT_CHAT_RESTORE)
                .off(NEW_EVENT_CLOSE)
                .off(NEW_EVENT_INACTIVE);
            socket.disconnect();
        };
    }, []);

    return app.isSearching ? (
        <div className="flex w-full justify-center items-center min-h-[calc(100vh-70px)] flex-col bg-primary">
            <ThreeDots fill="rgb(255 159 28)" />
            <div className="text-lg text-center text-white">{loadingText}</div>
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
    ) : (
        <Anonymous onChatClosed={startNewSearch} />
    );
};

export default BuddyMatcher;
