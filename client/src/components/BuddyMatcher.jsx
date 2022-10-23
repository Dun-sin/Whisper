import { useState, useContext, useEffect } from 'react';
import { ThreeDots } from 'react-loading-icons';
import { SocketContext } from 'context/Context';

import Anonymous from 'components/Anonymous';
import { useAuth } from 'src/context/AuthContext';
import { useChat } from 'src/context/ChatContext';
import { useNavigate } from 'react-router-dom';

const BuddyMatcher = () => {
    const navigate = useNavigate();
    const { auth } = useAuth();
    const { createChat, closeChat, closeAllChats } = useChat();

    // eslint-disable-next-line no-unused-vars
    const [isFound, setIsFound] = useState(false);
    const socket = useContext(SocketContext);

    const userID = auth.loginId;
    const defaultLoadingText = <p>Looking for a random buddy</p>;
    const [loadingText, setLoadingText] = useState(defaultLoadingText);
    let timeout = null;

    const startNewSearch = () => {
        setIsFound(false);
        setLoadingText(defaultLoadingText);
        socket.emit('join', { loginId: auth.loginId, email: auth.email });
    };

    useEffect(() => {
        if (loadingText === defaultLoadingText) {
            timeout = setTimeout(() => {
                setLoadingText(
                    <p>
                        Taking too long? No chat buddy is currently available :({' '}
                        <br />{' '}
                        <a
                            href="https://ctt.ac/US0h0"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Tweet
                        </a>{' '}
                        about this app and get more people to use it!
                    </p>
                );
            }, 15000);
        }

        return () => {
            clearTimeout(timeout);
        };
    }, [loadingText]);

    useEffect(() => {
        if (isFound) {
            return;
        }

        if (!socket.connected) {
            socket.connect();
        }

        socket.on('close', (chatId) => {
            setIsFound(false);
            closeChat(chatId);

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
            socket.emit('join', { loginId: auth.loginId, email: auth.email });
        });
        socket.connected && socket.emit('adding', { userID });
        socket.emit('createRoom', `${userID}-in-search`);
        // From here will get the info from server that user has joined the room

        socket.on('joined', ({ roomId, userIds }) => {
            localStorage.setItem('currentChatId', roomId);

            createChat(roomId, userIds);
            setIsFound(true);
        });

        socket.on('chat_restore', ({ chats, currentChatId }) => {
            localStorage.setItem('currentChatId', currentChatId);
            Object.values(chats).forEach((chat) => {
                createChat(
                    chat.id,
                    chat.userIds,
                    chat.messages,
                    chat.createdAt
                );
            });

            setIsFound(true);
        });

        socket.on('inactive', () => {
            closeAllChats();
            localStorage.removeItem('currentChatId');

            setIsFound(false);
        });

        return () => {
            socket
                .off('connect')
                .off('joined')
                .off('chat_restore')
                .off('close')
                .off('inactive');
            socket.disconnect();
        };
    }, []);

    return isFound ? (
        <Anonymous onChatClosed={startNewSearch} />
    ) : (
        <div className="flex w-full justify-center items-center min-h-[86.5vh] flex-col bg-primary">
            <ThreeDots fill="rgb(255 159 28)" />
            <div className="text-lg text-center text-white">{loadingText}</div>
        </div>
    );
};

export default BuddyMatcher;
