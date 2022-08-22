import React, { useState, useEffect, useRef, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SocketContext } from '../../Context';

import './Chat.css';

import ScrollToBottom from 'react-scroll-to-bottom';
import { IoSend } from 'react-icons/io5';

import { addMessages } from '../../redux/Reducers/messageSlice';

let senderId;
const Chat = () => {
    const socket = useContext(SocketContext);
    const [sentMessages, setSentMessages] = useState([]);
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [messages, setMessages] = useState([]);
    const inputRef = useRef('');

    const gettingState = useSelector((state) => state);
    const state = gettingState.messages;
    senderId = gettingState.ID;
    const dispatch = useDispatch();

    useEffect(() => {
        socket.on('receive_message', ({ senderId, message, time }) => {
            console.log(`reciever: ${message}`);
            console.log(sentMessages, receivedMessages)

            dispatch(
                addMessages({
                    id: senderId,
                    messages: {
                        message: message,
                        time: time,
                    },
                    room: 'anon',
                })
            );
        });

        // Socket.on('privatemessage',(msg) => {
        //     console.log("Here is message :--->",msg)
        // })



    }, [dispatch, socket]);

    useEffect(() => {
        const userIDs = Object.keys(state).map((item) => Number(item));
        const available = userIDs.length === 0;
        const sendID = userIDs.find((item) => item === senderId);
        const receiverID = userIDs.find((item) => item !== senderId);
        const handleMessages = () => {
            sendID && setSentMessages(state[sendID].messages);
            receiverID && setReceivedMessages(state[receiverID].messages);
        };
        !available && handleMessages();
    }, [state]);

    useEffect(() => {
        const array = [...sentMessages, ...receivedMessages].sort((a, b) => {
            const da = new Date(a.time),
                db = new Date(b.time);
            return da - db;
        });
        setMessages(array);
    }, [sentMessages, receivedMessages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const d = new Date();
        const time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
        const message = inputRef.current.value;
        if (message === '' || senderId === undefined || senderId === '123456') {
            return;
        }
        socket.emit('send_message', { senderId, message, time });
        console.log(`sender: ${message}`);
        // Socket.emit('privatemessage', message);
        dispatch(
            addMessages({
                id: senderId,
                messages: {
                    message: message,
                    time: time,
                },
                room: 'anon',
            })
        );
        inputRef.current.value = '';
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
                {messages.map(({ message, time }, index) => (
                    <div
                        key={index}
                        className={`relative mb-[15px] w-[250px] text-primary ml-auto}`}
                    >
                        <p className="bg-[#FF9F1C] rounded-[20px] p-[15px] break-all">
                            {message}
                        </p>
                        <p className="text-white ml-[75%] text-[12px]">
                            {time}
                        </p>
                    </div>
                ))}
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
