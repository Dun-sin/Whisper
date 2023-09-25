/* eslint-disable max-len */
import { useEffect, useRef, useContext, useMemo, useState } from 'react';
import { SocketContext } from 'context/Context';

import 'styles/chat.css';

import ScrollToBottom from 'react-scroll-to-bottom';
import Dropdown from 'rsuite/Dropdown';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

import { ImCancelCircle } from 'react-icons/im';
import { IoSend } from 'react-icons/io5';
import { BiDotsVerticalRounded } from 'react-icons/bi';

import { v4 as uuid } from 'uuid';
import { debounce } from 'lodash';
import MarkdownIt from 'markdown-it';

import { useChat } from 'src/context/ChatContext';
import { useAuth } from 'src/context/AuthContext';
import { useApp } from 'src/context/AppContext';

import useChatUtils from 'src/lib/chat';
import MessageStatus from './MessageStatus';
import listOfBadWordsNotAllowed from 'src/lib/badWords';
import { useNotification } from 'src/lib/notification';

let senderId;
const Chat = () => {
    const { app } = useApp();
    const { playNotification } = useNotification();
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
    const { authState, dispatchAuth } = useAuth();
    const { logout } = useKindeAuth()
    const socket = useContext(SocketContext);

    const { sendMessage, deleteMessage, editMessage } = useChatUtils(socket);
    const inputRef = useRef('');


    senderId = authState.email ?? authState.loginId;

    const getMessage = (id) => {
        if (!state[app.currentChatId]) {
            return null;
        }

        return state[app.currentChatId].messages[id];
    };

    const messageExists = (id) => {
        return Boolean(getMessage(id));
    };

    const md = new MarkdownIt({
        html: false,
        linkify: true,
        typographer: true
    });

    function logOut() {
        dispatchAuth({
            type: 'LOGOUT'
        })
        logout()
    }

    useEffect(() => {
        const newMessageHandler = (message) => {
            try {
                addMessage(message);
                playNotification('newMessage');
            } catch {
                logOut()
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

        return () => {
            socket.off('receive_message', newMessageHandler);
            socket.off('delete_message', deleteMessageHandler);
            socket.off('edit_message', editMessageHandler);
        };
    }, []);

    const cancelEdit = () => {
        inputRef.current.value = '';
        setEditing({ isediting: false, messageID: null });
        socket
            .timeout(10000)
            .emit('typing', { chatId: app.currentChatId, isTyping: false });
    };

    // Clear chat when escape is pressed
    useEffect(() => {
        const keyDownHandler = (event) => {
            if (event.key === 'Escape' && editing.isediting) {
                event.preventDefault();
                cancelEdit();
            }
        };

        document.addEventListener('keydown', keyDownHandler);

        return () => {
            document.removeEventListener('keydown', keyDownHandler);
        };
    }, [editing]);

    const sortedMessages = useMemo(
        () =>
            Object.values(state[app.currentChatId]?.messages ?? {})?.sort(
                (a, b) => {
                    const da = new Date(a.time),
                        db = new Date(b.time);
                    return da - db;
                }
            ),
        [state, app.currentChatId]
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
            logOut();
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
                logOut();
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
                logOut();
            }

            return false;
        } 

        return true;
    };

    const handleDelete = async (id) => {
        if (!messageExists(id)) {
            return;
        }

        const messageObject = getMessage(id);
        const { message } = messageObject

        if (message.includes('Warning Message')) {
            return;
        }

        updateMessage(id, {
            ...messageObject,
            status: 'pending',
        });

        try {
            const messageDeleted = await deleteMessage({
                id,
                chatId: messageObject.room,
            });

            if (!messageDeleted) {
                updateMessage(id, messageObject);
                return;
            }

            removeMessage(id, messageObject.room);
        } catch {
            updateMessage(id, messageObject);
        }
    };

    const warningMessage = (sender, message) => {
        // TODO: Instrad of replacing the message we should add some kind of increment for the users to decide to see the message or not
        if (message.includes('Warning Message')) {
            if (senderId === sender) {
                return (
                    <span className="text-red">
                        ADMIN MESSAGE: You are trying to send a bad word!
                    </span>
                );
            } else {
                return (
                    <span className="text-black">
                        ADMIN MESSAGE: The person you are chatting with is
                        trying to send a bad word!
                    </span>
                );
            }
        }
    };

    // Here whenever user will submit message it will be send to the server
    const handleSubmit = async (e) => {
        e.preventDefault();

        socket.emit('typing', { chatId: app.currentChatId, isTyping: false });
        const d = new Date();
        let message = inputRef.current.value;

        if (message === '' || senderId === undefined || senderId === '123456') {
            return;
        }

        const splitMessage = message.split(' ');
        for (const word of splitMessage) {
            // TODO: We need a better way to implement this
            if (listOfBadWordsNotAllowed.includes(word)) {
                message = 'Warning Message: send a warning to users';
            }
        }

        if (editing.isediting === true) {
            try {
                await editMessage({
                    id: editing.messageID,
                    chatId: app.currentChatId,
                    newMessage: message,
                });
                editText(editing.messageID, app.currentChatId, message);
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
                room: app.currentChatId,
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

        if (message.includes('Warning Message')) {
            cancelEdit();
            return;
        }
        inputRef.current.value = message;

        setEditing({ isediting: true, messageID: id });
    };

    const handleTypingStatus = debounce((e) => {
        if (e.target.value.length > 0) {
            socket
                .timeout(5000)
                .emit('typing', { chatId: app.currentChatId, isTyping: true });
        } else {
            socket
                .timeout(10000)
                .emit('typing', { chatId: app.currentChatId, isTyping: false });
        }
    }, 500);

    const handleCopyToClipBoard = async (id) => {
        const { message } = getMessage(id);
        if (message.includes('Warning Message')) {
            return;
        }
        if ('clipboard' in navigator) {
            return await navigator.clipboard.writeText(message);
        } else {
            return document.execCommand('copy', true, message);
        }
    };
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
        <div className="w-full md:h-[90%] min-h-[100%] pb-[25px] flex flex-col justify-between">
            <div className="max-h-[67vh]">
                <p className="text-[0.8em] font-semibold mb-[10px] mt-[20px] text-center">
                    Connected with a random User{sortedMessages.length === 0 && ', Be the first to send {"Hello"}'}
                </p>
                <ScrollToBottom
                    initialScrollBehavior="auto"
                    className="displayMessgaes h-[100%] max-h-[70vh] md:max-h-full overflow-y-scroll w-[100%] "
                >
                    {sortedMessages.map(
                        ({ senderId: sender, id, message, time, status }) => {
                            const resultOfWarningMessage = warningMessage(
                                sender,
                                message
                            );
                            !(resultOfWarningMessage === undefined) &&
                                (message = resultOfWarningMessage);



                            return (
                                <div
                                    key={id}
                                    className={`message-block ${sender.toString() ===
                                        senderId.toString()
                                        ? 'me'
                                        : 'other'
                                        }`}
                                >
                                    <div className="message">
                                        <div
                                            className={`content text ${sender.toString() ===
                                                senderId.toString() &&
                                                'justify-between'
                                                }`}
                                        >

                                            <span
                                                dangerouslySetInnerHTML={{ __html: md.render(message) }}
                                            />


                                            {sender.toString() ===
                                                senderId.toString() &&
                                                status !== 'pending' && (
                                                    <Dropdown
                                                        placement="leftStart"
                                                        style={{ zIndex: 3 }}
                                                        renderToggle={
                                                            renderIconButton
                                                        }
                                                        NoCaret
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
                                                        <Dropdown.Item
                                                            onClick={() =>
                                                                handleCopyToClipBoard(
                                                                    id
                                                                )
                                                            }
                                                        >
                                                            Copy
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
                                                onResend={() =>
                                                    handleResend(id)
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        }
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
