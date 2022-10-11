import { useState, useContext, useEffect } from 'react';
import { ThreeDots } from 'react-loading-icons';
import { SocketContext } from 'context/Context';

import Anonymous from 'components/Anonymous';
import { useAuth } from 'src/context/AuthContext';

const Searching = () => {
    const { auth } = useAuth();
    // eslint-disable-next-line no-unused-vars
    const [isFound, setIsFound] = useState(false);
    const socket = useContext(SocketContext);

    const userID = auth.loginId;
    const defaultLoadingText = 'Looking for a random buddy';
    const [loadingText, setLoadingText] = useState(defaultLoadingText);
    let timeout = null;

    useEffect(() => {
        if (loadingText === defaultLoadingText) {
            timeout = setTimeout(() => {
                setLoadingText(
                    'Taking too long? No chat buddy is currently available :(\nTry refreshing!'
                );
            }, 5000);
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

        // This is necessary else chat won't be restored after re-connections
        socket.on('connect', () => {
            // Here server will be informed that user is searching for
            // another user
            socket.emit('join', { loginId: auth.loginId, email: auth.email });
        });
        socket.connected && socket.emit('adding', { userID });
        socket.emit('createRoom', `${userID}-in-search`);
        // From here will get the info from server that user has joined the room

        socket.on('joined', ({ roomId }) => {
            console.log(roomId); // Had to do this to make eslint happy lol
            setIsFound(true);
        });

        socket.on('chat_restore', ({ chats, currentChatId }) => {
            setIsFound(true);
            console.log('chat restored!', chats, currentChatId);
        });

        return () => {
            socket.off('connect').off('joined').off('chat_restore');
            socket.disconnect();
        };
    }, []);

    return isFound ? (
        <Anonymous />
    ) : (
        <div className="flex w-full justify-center items-center h-screen flex-col">
            <ThreeDots fill="rgb(1, 22, 39)" />
            <div className="text-lg text-center">
                {loadingText.split('\n').map((text) => (
                    <p key={text}>{text}</p>
                ))}
            </div>
        </div>
    );
};

export default Searching;
