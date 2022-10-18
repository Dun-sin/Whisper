import { useEffect, useRef, useContext, useMemo, useState } from 'react';
import { SocketContext } from 'context/Context';

import 'styles/chat.css';

import ScrollToBottom from 'react-scroll-to-bottom';
import Dropdown from 'rsuite/Dropdown';
import { IoSend } from 'react-icons/io5';
import { BiDotsVerticalRounded } from 'react-icons/bi';

import { v4 as uuid } from 'uuid';

import { useChat } from 'src/context/ChatContext';
import { useAuth } from 'src/context/AuthContext';
import useChatUtils from 'src/lib/chat';
import MessageStatus from './MessageStatus';

let senderId;
const Chat = () => {
    const [currentChatId, setCurrentChatId] = useState(null);
    const [editing, setEditing] = useState(
        { isediting: false, messageID: null }
    );
    const {
        messages: state,
        addMessage,
        updateMessage,
        removeMessage,
    } = useChat();
    const { auth, logout } = useAuth();
    const socket = useContext(SocketContext);

    const { sendMessage, deleteMessage } = useChatUtils(socket);
    const inputRef = useRef('');
    senderId = auth.loginId;

    const getMessage = (id) => {
        if (!state[currentChatId]) {
            return null;
        }

        return state[currentChatId].messages[id];
    };


    const messageExists = (id) => {
        return Boolean(getMessage(id));
    };

    useEffect(() => {
        const newMessageHandler = (message) => {
            try {
                addMessage(message);
            } catch {
                logout();
            }
        };

        const deleteMessageHandler = ({ id, chatId }) => {
            removeMessage(id, chatId);
        };

        // This is used to recive message form other user.
        socket.on('receive_message', newMessageHandler);
        socket.on('delete_message', deleteMessageHandler);
        setCurrentChatId(localStorage.getItem('currentChatId'));

        return () => {
            socket.off('receive_message', newMessageHandler);
            socket.off('delete_message', deleteMessageHandler);
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

    const doSend = async ({
        senderId,
        room,
        tmpId = uuid(),
        message,
        time,
    }) => {
        try {
            addMessage({
                senderId,
                room,
                id: tmpId,
                message,
                time,
                status: 'pending',
            });
        } catch {
            logout();
            return false;
        }

        try {
            const sentMessage = await sendMessage({
                senderId,
                message,
                time,
                chatId: room,
            });

            try {
                updateMessage(tmpId, sentMessage);
            } catch {
                logout();
                return false;
            }
        } catch (e) {
            try {
                updateMessage(tmpId, {
                    senderId,
                    room,
                    id: tmpId,
                    message,
                    time,
                    status: 'failed',
                });
            } catch {
                logout();
            }

            return false;
        } finally {
            // Socket.emit('privatemessage', message);
            // addMessage({
            //     id: senderId,
            //     message,
            //     time,
            //     room: 'anon',
            // });
        }

        return true;
    };

    const handleDelete = async (id) => {
        if (!messageExists(id)) {
            return;
        }

        const message = getMessage(id);
        updateMessage(id, {
            ...message,
            status: 'pending',
        });

        try {
            const messageDeleted = await deleteMessage({
                id,
                chatId: message.room,
            });

            if (!messageDeleted) {
                updateMessage(id, message);
                return;
            }

            removeMessage(id, message.room);
        } catch {
            updateMessage(id, message);
        }
    };


    // Here whenever user will submit message it will be send to the server
    const handleSubmit = (e) => {
        e.preventDefault();

        const d = new Date();
        const message = inputRef.current.value;
        if (message === '' || senderId === undefined || senderId === '123456') {
            return;
        }

        if (editing.isediting === true) {
            const { time } = getMessage(editing.messageID);
            handleDelete(editing.messageID)
            doSend({
                senderId,
                room: currentChatId,
                message,
                time: time,
            });
            setEditing({ isediting: false, messageID: null })
        } else {
            doSend({
                senderId,
                room: currentChatId,
                message,
                time: d.getTime(),
            });
        }

        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.focus();
        }
    };

    const handleResend = (id) => {
        if (!messageExists(id)) {
            return;
        }

        const { senderId, room, message, time } = getMessage(id);

        doSend({
            senderId,
            room,
            message,
            time,
            tmpId: id,
        });
    };

    const handleEdit = (id) => {
        const { message } = getMessage(id)
        inputRef.current.value = message;
        setEditing({ isediting: true, messageID: id })

    }

    const getTime = (time) => {
        return new Date(time).toLocaleTimeString();
    };

    const renderIconButton = (props) => {
        return (
            <BiDotsVerticalRounded
                {...props}
                className="fill-primary scale-[1.8]"
            />
        );
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
                            className={`message-block ${sender.toString() === senderId.toString()
                                ? 'me'
                                : 'other'
                                }`}
                        >
                            <div className="message">
                                <div className="content">
                                    <p className="text">{message}</p>
                                    {sender.toString() ===
                                        senderId.toString() &&
                                        status !== 'pending' && (
                                            <Dropdown
                                                placement="leftStart"
                                                style={{ zIndex: 3 }}
                                                renderToggle={renderIconButton}
                                                noCaret
                                            >
                                                <Dropdown.Item
                                                    onClick={() =>
                                                        handleDelete(id)
                                                    }
                                                >
                                                    Delete
                                                </Dropdown.Item>
                                                <Dropdown.Item
                                                    onClick={() =>
                                                        handleEdit(id)
                                                    }
                                                >
                                                    Edit
                                                </Dropdown.Item>
                                            </Dropdown>
                                        )}
                                </div>
                                <div
                                    className={`status ${status === 'failed'
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
                                        onResend={() => handleResend(id)}
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
