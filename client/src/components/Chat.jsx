import { useEffect, useRef, useContext, useMemo, useState } from 'react';
import { SocketContext } from 'context/Context';

import 'styles/chat.css';

import ScrollToBottom from 'react-scroll-to-bottom';
import { IoSend } from 'react-icons/io5';
import { v4 as uuid } from 'uuid';

import { useChat } from 'src/context/ChatContext';
import { useAuth } from 'src/context/AuthContext';
import useChatUtils from 'src/lib/chat';
import MessageStatus from './MessageStatus';

let senderId;
const Chat = () => {
    const [currentChatId, setCurrentChatId] = useState(null);
    const { messages: state, addMessage, updateMessage } = useChat();
    const { auth, logout } = useAuth();
    const socket = useContext(SocketContext);

    const { sendMessage } = useChatUtils(socket);
    const inputRef = useRef('');
    senderId = auth.loginId;
    useEffect(() => {
        const newMessageHandler = (message) => {
            try {
                addMessage(message);
            } catch {
                logout();
            }
        };

        // This is used to recive message form other user.
        socket.on('receive_message', newMessageHandler);
        setCurrentChatId(localStorage.getItem('currentChatId'));

        return () => {
            socket.off('receive_message', newMessageHandler);
        };
    }, []);

    const sortedMessages = useMemo(
        () =>
            Object.values(state[currentChatId]?.messages ?? {})?.sort(
                (a, b) => {
                    const da = new Date(a.time),
                        db = new Date(b.time);
                    return da - db;
                }
            ),
        [state, currentChatId]
    );

    // Here whenever user will submit message it will be send to the server
    const handleSubmit = async (e) => {
        e.preventDefault();

        const d = new Date();
        const time = d.getTime();
        const message = inputRef.current.value;
        if (message === '' || senderId === undefined || senderId === '123456') {
            return;
        }

        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.focus();
        }

        const tmpId = uuid();

        try {
            addMessage({
                senderId,
                room: currentChatId,
                id: tmpId,
                message,
                time,
                status: 'pending',
            });
        } catch {
            logout();
        }

        try {
            console.log('sending...');
            const sentMessage = await sendMessage({
                senderId,
                message,
                time,
            });

            try {
                updateMessage(tmpId, sentMessage);
            } catch {
                logout();
            }
        } catch (e) {
            try {
                updateMessage(tmpId, {
                    senderId,
                    room: currentChatId,
                    id: tmpId,
                    message,
                    time,
                    status: 'failed',
                });
            } catch {
                logout();
            }
        } finally {
            console.log('send complete');
            console.log(`sender: ${message}`);
            // Socket.emit('privatemessage', message);
            // addMessage({
            //     id: senderId,
            //     message,
            //     time,
            //     room: 'anon',
            // });
        }
    };

    const getTime = (time) => {
        return new Date(time).toLocaleTimeString();
    };
    return (
        <div className="w-[100%] h-[90%] pb-[25px]">
            <p className="text-[0.8em] font-semibold mb-[20px] text-center">
                Connected with a random User
            </p>
            <ScrollToBottom
                initialScrollBehavior="auto"
                className="displayMessgaes h-[75%] w-[100%]"
            >
                {sortedMessages.map(
                    ({ senderId: sender, id, message, time, status }) => (
                        <div
                            key={id}
                            className={`message-block ${
                                sender.toString() === senderId.toString()
                                    ? 'me'
                                    : 'other'
                            }`}
                        >
                            <div className="message">
                                <p className="content">{message}</p>
                                <div
                                    className={`status ${
                                        status === 'failed'
                                            ? 'text-red-600'
                                            : 'text-white'
                                    }`}
                                >
                                    <MessageStatus
                                        time={getTime(time)}
                                        status={status ?? 'sent'}
                                        iAmTheSender={
                                            sender.toString() ===
                                            senderId.toString()
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    )
                )}
            </ScrollToBottom>
            <form
                className="flex justify-center items-center mt-[40px]"
                onSubmit={handleSubmit}
            >
                <input
                    placeholder="Send a Message....."
                    className="h-[65px] focus:outline-none rounded-[15px] bg-secondary w-[100%] text-white pl-[22px] pr-[22px] text-[18px]"
                    ref={inputRef}
                />
                <button
                    type="submit"
                    className="bg-[#FF9F1C] h-[65px] w-[70px] flex justify-center items-center rounded-[10px]"
                >
                    <IoSend className="fill-primary scale-[2]" />
                </button>
            </form>
        </div>
    );
};

export default Chat;
