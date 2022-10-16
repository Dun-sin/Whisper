import { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { SocketContext } from 'context/Context';

import 'styles/chat.css';

import ScrollToBottom from 'react-scroll-to-bottom';
import { IoSend } from 'react-icons/io5';

import { useChat } from 'src/context/ChatContext';
import { useAuth } from 'src/context/AuthContext';
import useChatUtils from 'src/lib/chat';

let senderId;
const Chat = () => {
    const { messages: state, addMessage } = useChat();
    const { auth } = useAuth();
    const socket = useContext(SocketContext);

    const { sendMessage } = useChatUtils(socket);
    const [sentMessages, setSentMessages] = useState([]);
    const [receivedMessages, setReceivedMessages] = useState([]);
    const inputRef = useRef('');
    senderId = auth.loginId;
    useEffect(() => {
        const newMessageHandler = ({ id, senderId, message, time }) => {
            addMessage({
                id: senderId,
                message,
                time,
                room: 'anon',
                messageId: id,
            });
        };

        // This is used to recive message form other user.
        socket.on('receive_message', newMessageHandler);

        return () => {
            socket.off('receive_message', newMessageHandler);
        };
    }, []);

    useEffect(() => {
        const userIDs = Object.keys(state).map((item) => item);
        const available = userIDs.length === 0;
        const sendID = userIDs.find((item) => item === senderId);
        const receiverID = userIDs.find((item) => item !== senderId);
        const handleMessages = () => {
            sendID && setSentMessages([...state[sendID].messages]);
            receiverID && setReceivedMessages([...state[receiverID].messages]);
        };
        !available && handleMessages();
    }, [state]);

    const sortedMessages = useMemo(
        () =>
            [...sentMessages, ...receivedMessages].sort((a, b) => {
                const da = new Date(a.time),
                    db = new Date(b.time);
                return da - db;
            }),
        [sentMessages, receivedMessages]
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

        try {
            console.log('sending...');
            const sentMessage = await sendMessage({
                senderId,
                message,
                time,
            });

            addMessage({
                id: sentMessage.senderId,
                message: sentMessage.message,
                time: sentMessage.time,
                room: 'anon',
                messageId: sentMessage.id,
            });
        } catch {
            console.log('Something went wrong on the server 4853789');
            addMessage({
                id: senderId,
                message,
                time,
                room: 'anon',
            });
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
                    ({ message, time, senderId: sender, id }) => (
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
                                <p className="time">{getTime(time)}</p>
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
