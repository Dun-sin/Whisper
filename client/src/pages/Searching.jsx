import { useState, useContext, useEffect } from 'react';
import { SocketContext } from 'context/Context';

import Anonymous from 'components/Anonymous';
import { useAuth } from 'src/context/AuthContext';

const Searching = () => {
    const { auth } = useAuth();
    // eslint-disable-next-line no-unused-vars
    const [isFound, setIsFound] = useState(false);
    const socket = useContext(SocketContext);

    const userID = auth.loginId;

    useEffect(() => {
        if (isFound) {
            return;
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
            console.log(roomId) // Had to do this to make eslint happy lol
            setIsFound(true);
        });

        socket.on('chat_restore', ({ chats, currentChatId }) => {
            setIsFound(true)
            console.log('chat restored!', chats, currentChatId)
        })
    }, [socket, userID]);

    return isFound ? <Anonymous /> : <div>Searching.....</div>;
};

export default Searching;
