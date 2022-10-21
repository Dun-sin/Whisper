/* eslint-disable max-len */
import { useEffect, useRef, useContext, useMemo, useState } from 'react';
import { SocketContext } from 'context/Context';

import 'styles/chat.css';

import ScrollToBottom from 'react-scroll-to-bottom';
import Dropdown from 'rsuite/Dropdown';

import { ImCancelCircle } from 'react-icons/im';
import { IoSend } from 'react-icons/io5';
import { BiDotsVerticalRounded } from 'react-icons/bi';

import { v4 as uuid } from 'uuid';
import { debounce } from 'lodash';

import { useChat } from 'src/context/ChatContext';
import { useAuth } from 'src/context/AuthContext';

import useChatUtils from 'src/lib/chat';
import MessageStatus from './MessageStatus';

let senderId;
const Chat = () => {
    const [currentChatId, setCurrentChatId] = useState(null);
    const [editing, setEditing] = useState({
        isediting: false,
        messageID: null,
    });
    const {
        messages: state,
        addMessage,
        updateMessage,
        removeMessage,
        editText,
    } = useChat();
    const { auth, logout } = useAuth();
    const socket = useContext(SocketContext);

    const { sendMessage, deleteMessage, editMessage } = useChatUtils(socket);
    const inputRef = useRef('');
    senderId = auth.email ?? auth.loginId;

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

        const editMessageHandler = ({ id, chatId, newMessage }) => {
            editText(id, chatId, newMessage);
        };

        // This is used to recive message form other user.
        socket.on('receive_message', newMessageHandler);
        socket.on('delete_message', deleteMessageHandler);
        socket.on('edit_message', editMessageHandler);
        setCurrentChatId(localStorage.getItem('currentChatId'));

        return () => {
            socket.off('receive_message', newMessageHandler);
            socket.off('delete_message', deleteMessageHandler);
            socket.off('edit_message', editMessageHandler);
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
    const handleSubmit = async (e) => {
        e.preventDefault();

        socket.emit('typing', { chatId: currentChatId, isTyping: false });
        const d = new Date();
        const message = inputRef.current.value;
        if (message === '' || senderId === undefined || senderId === '123456') {
            return;
        }

        if (editing.isediting === true) {
            try {
                await editMessage({
                    id: editing.messageID,
                    chatId: currentChatId,
                    newMessage: message,
                });
                editText(editing.messageID, currentChatId, message);
                const messageObject = getMessage(editing.messageID);
                updateMessage(editing.messageID, messageObject);
            } catch {
                setEditing({ isediting: false, messageID: null });
                return;
            }
            setEditing({ isediting: false, messageID: null });
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
        inputRef.current.focus();

        const { message } = getMessage(id);
        inputRef.current.value = message;
        setEditing({ isediting: true, messageID: id });
    };

    const cancelEdit = () => {
        inputRef.current.value = '';
        setEditing({ isediting: false, messageID: null });
        socket
            .timeout(10000)
            .emit('typing', { chatId: currentChatId, isTyping: false });
    };

    const handleTypingStatus = debounce((e) => {
        if (e.target.value.length > 0) {
            socket
                .timeout(5000)
                .emit('typing', { chatId: currentChatId, isTyping: true });
        } else {
            socket
                .timeout(10000)
                .emit('typing', { chatId: currentChatId, isTyping: false });
        }
    }, 500);

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
        <div className="w-[100%] md:h-[90%] min-h-[100%] mdl:min-h-[80.7vh] pb-[25px] flex flex-col justify-between">
            <div className="max-h-[67vh]">
                <p className="text-[0.8em] font-semibold mb-[10px] mt-[20px] text-center">
                    Connected with a random User
                </p>
                <ScrollToBottom
                    initialScrollBehavior="auto"
                    className="displayMessgaes h-[100%] mdl:max-h-[62vh] overflow-y-scroll w-[100%] "
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
                                    <div className="content">
                                        <p className="text">{message}</p>
                                        {sender.toString() ===
                                            senderId.toString() &&
                                            status !== 'pending' && (
                                                <Dropdown
                                                    placement="leftStart"
                                                    style={{ zIndex: 3 }}
                                                    renderToggle={
                                                        renderIconButton
                                                    }
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
                                            onResend={() => handleResend(id)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </ScrollToBottom>
            </div>
            <form
                className="flex justify-center items-center mt-[40px]"
                onSubmit={handleSubmit}
            >
                <div className="w-[100%] flex items-center justify-between bg-secondary rounded-[15px]">
                    <input
                        placeholder="Send a Message....."
                        className="h-[65px] focus:outline-none w-[96%] bg-secondary text-white rounded-[15px] pl-[22px] pr-[22px] text-[18px]"
                        ref={inputRef}
                        onChange={handleTypingStatus}
                    />
                    {editing.isediting && (
                        <ImCancelCircle
                            onClick={cancelEdit}
                            className="fill-white mr-5 scale-[1.3] cursor-pointer"
                        />
                    )}
                </div>
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
