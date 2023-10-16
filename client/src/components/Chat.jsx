/* eslint-disable max-len */
import { useEffect, useRef, useContext, useMemo, useState } from 'react';
import { SocketContext } from 'context/Context';
import useKeyPress, { ShortcutFlags } from 'src/hooks/useKeyPress';

import 'styles/chat.css';

import ScrollToBottom from 'react-scroll-to-bottom';
import Dropdown from 'rsuite/Dropdown';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

import { ImCancelCircle } from 'react-icons/im';
import { IoIosArrowDropright } from 'react-icons/io';
import { IoSend } from 'react-icons/io5';
import { BiDotsVerticalRounded } from 'react-icons/bi';
import { BsArrow90DegLeft, BsArrow90DegRight } from 'react-icons/bs';

import { v4 as uuid } from 'uuid';
import { throttle } from 'lodash';
import MarkdownIt from 'markdown-it';

import { useChat } from 'src/context/ChatContext';
import { useAuth } from 'src/context/AuthContext';
import { useApp } from 'src/context/AppContext';

import useChatUtils from 'src/lib/chat';
import MessageStatus from './MessageStatus';
import listOfBadWordsNotAllowed from 'src/lib/badWords';
import { useNotification } from 'src/lib/notification';
import { NEW_EVENT_DELETE_MESSAGE, NEW_EVENT_EDIT_MESSAGE, NEW_EVENT_RECEIVE_MESSAGE, NEW_EVENT_TYPING } from '../../../constants.json';
import { createBrowserNotification } from 'src/lib/browserNotification';
import { createClassesFromArray } from 'src/lib/utils';

const inactiveTimeThreshold = 180000 // 3 mins delay
let senderId;
let inactiveTimeOut;

const Chat = () => {
    const { app } = useApp();
    const { playNotification } = useNotification();
    const [editing, setEditing] = useState({
        isediting: false,
        messageID: null,
    });
    const [isQuoteReply, setIsQuoteReply] = useState(false)
    const [message, setMessage] = useState('');
    const [quoteMessage, setQuoteMessage] = useState(null)
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

    const [lastMessageTime, setLastMessageTime] = useState(null)


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

    const cancelEdit = () => {
        inputRef.current.value = '';
        setEditing({ isediting: false, messageID: null });
        socket
            .timeout(10000)
            .emit(NEW_EVENT_TYPING, { chatId: app.currentChatId, isTyping: false });
    };


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

    const [currentReplyMessageId, setCurrentReplyMessageId] = useState(null);
    const currentReplyMessage =
        app.currentChatId && currentReplyMessageId
            ? state[app.currentChatId]?.messages?.[currentReplyMessageId] ?? null
            : null;
    function startReply(id) {
        setCurrentReplyMessageId(id);
    }
    function viewRepliedMessage(id) {
        const element = document.getElementById(`message-${id}`);

        const alreadyHighlighted = element.classList.contains('bg-[#FF9F1C]/25');

        element.scrollIntoView({
            behavior: 'auto',
        });

        if (alreadyHighlighted) {
            element.classList.replace('bg-[#FF9F1C]/25', 'bg-[#FF9F1C]/50');
        } else {
            element.classList.add('bg-[#FF9F1C]/50');
        }

        element.addEventListener(
            'transitionend',
            () => {
                if (alreadyHighlighted) {
                    element.classList.replace('bg-[#FF9F1C]/50', 'bg-[#FF9F1C]/25');
                } else {
                    element.classList.remove('bg-[#FF9F1C]/50');
                }
            },
            {
                once: true,
            }
        );
    }

    const doSend = async ({
        senderId,
        room,
        tmpId = uuid(),
        message,
        time,
        replyTo = null
    }) => {
        try {
            addMessage({
                senderId,
                room,
                id: tmpId,
                message,
                time,
                status: 'pending',
                replyTo
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
                replyTo
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
                    replyTo
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

        socket.emit(NEW_EVENT_TYPING, { chatId: app.currentChatId, isTyping: false });
        const d = new Date();
        let message = inputRef.current.value.trim();        // Trim the message to remove the extra spaces

        if (!isQuoteReply) {
            const cleanedText = message.replace(/>+/g, '');
            message = cleanedText
        }

        if (message === '' || senderId === undefined || senderId === '123456') {
            return;
        }
        
        if (isQuoteReply && message.trim() === quoteMessage.trim()) {
            return;
        }
        

        setIsQuoteReply(false)
        setQuoteMessage(null)

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
                replyTo: currentReplyMessageId
            });
        }

        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.focus();
        }

        setCurrentReplyMessageId(null);
    };

    // Define a new function to handle "Ctrl + Enter" key press
    const handleCtrlEnter = (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    // Use the useKeyPress hook to listen for "Ctrl + Enter" key press
    useKeyPress(['Enter'], handleCtrlEnter, ShortcutFlags.ctrl);


    const handleResend = (id) => {
        if (!messageExists(id)) {
            return;
        }

        const { senderId, room, message, time, replyTo } = getMessage(id);

        doSend({
            senderId,
            room,
            message,
            time,
            tmpId: id,
            replyTo
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

    const handleQuoteReply = (id) => {
        inputRef.current.focus();

        const { message } = getMessage(id);
        if (message.includes('Warning Message')) {
            cancelEdit();
            return;
        }

        const quotedMessage = `> ${message}
        
`;
        inputRef.current.value = quotedMessage;
        setIsQuoteReply(true)
        setQuoteMessage(quotedMessage)
    };

    const adjustTextareaHeight = () => {
        if (inputRef.current) {
          const minTextareaHeight = '45px';
          const currentScrollHeight = inputRef.current.scrollHeight + 'px';
          
          inputRef.current.style.height = Math.max(
            parseInt(minTextareaHeight),
            parseInt(currentScrollHeight)
          ) + 'px';
        }
      };

    const handleTypingStatus = throttle((e) => {
        if (e.target.value.length > 0) {
            socket
                .timeout(5000)
                .emit(NEW_EVENT_TYPING, { chatId: app.currentChatId, isTyping: true });
        }
        setMessage(e.target.value);
        adjustTextareaHeight();
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
                className="fill-white scale-[1.8]"
            />
        );
    };

    const renderIconButtonReceiver = (props) => {
        return (
            <BiDotsVerticalRounded
                {...props}
                className="fill-white scale-[1.8]"
            />
        );
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

    useEffect(() => {
        const newMessageHandler = (message) => {
            try {
                addMessage(message);
                playNotification('newMessage');
                createBrowserNotification(
                    'You received a new message on Whisper', message.message)
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
        socket.on(NEW_EVENT_RECEIVE_MESSAGE, newMessageHandler);
        socket.on(NEW_EVENT_DELETE_MESSAGE, deleteMessageHandler);
        socket.on(NEW_EVENT_EDIT_MESSAGE, editMessageHandler);

        return () => {
            socket.off(NEW_EVENT_RECEIVE_MESSAGE, newMessageHandler);
            socket.off(NEW_EVENT_DELETE_MESSAGE, deleteMessageHandler);
            socket.off(NEW_EVENT_EDIT_MESSAGE, editMessageHandler);
        };
    }, []);

    const checkPartnerResponse = () => {
        const currentTime = new Date().getTime();
        const isInactive = lastMessageTime && currentTime - lastMessageTime > inactiveTimeThreshold;
        if (isInactive) {
            createBrowserNotification("your partner isn't responding, want to leave?");
        }
    };

    useEffect(()=>{
        const newLastMessageTime = sortedMessages.filter((message) => message.senderId !== senderId).pop()?.time;
        if(newLastMessageTime !== lastMessageTime){
            setLastMessageTime(newLastMessageTime);
            clearTimeout(inactiveTimeOut);
            inactiveTimeOut = setTimeout(checkPartnerResponse,inactiveTimeThreshold);
        }
    },[sortedMessages])


    return (
        <div className="w-full md:h-[90%] min-h-[100%] pb-[25px] flex flex-col justify-between gap-6">
            <div className="max-h-[67vh]">
                <p className="text-[0.8em] font-semibold mb-[10px] mt-[20px] text-center">
                    Connected with a random User{sortedMessages.length === 0 && ', Be the first to send {"Hello"}'}
                </p>
                <ScrollToBottom
                    initialScrollBehavior="auto"
                    className="h-[100%] max-h-[70vh] md:max-h-full overflow-y-scroll w-full scroll-smooth"
                >
                    {sortedMessages.map(
                        ({ senderId: sender, id, message, time, status, replyTo }) => {
                            const resultOfWarningMessage = warningMessage(
                                sender,
                                message
                            );
                            !(resultOfWarningMessage === undefined) &&
                                (message = resultOfWarningMessage);
                            const repliedMessage = replyTo
                                ? state[app.currentChatId]?.messages?.[replyTo] ?? null
                                : null;


                            return (
                                <div
                                    key={id}
                                    className={createClassesFromArray(
                                        'flex flex-col gap-2 py-2 duration-500 transition-all',
                                        currentReplyMessageId === id &&
                                            'bg-[#FF9F1C]/25 border-[#FF9F1C]',
                                        currentReplyMessageId === id &&
                                            (sender.toString() === senderId.toString()
                                                ? 'border-r-[3.5px]'
                                                : 'border-l-[3.5px]')
                                    )}
                                    id={`message-${id}`}
                                >
                                    {replyTo && (
                                        <div
                                            className={createClassesFromArray(
                                                'max-w-[80%] md:max-w-[50%] min-w-[10px] flex gap-2 items-center',
                                                sender.toString() === senderId.toString() && 'self-end',
                                                repliedMessage && 'cursor-pointer'
                                            )}
                                            onClick={() => viewRepliedMessage(replyTo)}
                                        >
                                            <div className="truncate border-b-4 border-[#FF9F1C] p-1">
                                                {repliedMessage ? (
                                                    typeof repliedMessage.message === 'string' ? (
                                                        <div
                                                            className="content--reply flex flex-nowrap items-center gap-2"
                                                            dangerouslySetInnerHTML={{
                                                                __html: md.render(
                                                                    repliedMessage.message
                                                                ),
                                                            }}
                                                        />
                                                    ) : (
                                                        repliedMessage.message
                                                    )
                                                ) : (
                                                    <p className="text-gray-400 uppercase text-sm italic">
                                                        Original Message Deleted
                                                    </p>
                                                )}
                                            </div>
                                            <div
                                                className={createClassesFromArray(
                                                    sender.toString() !== senderId.toString() &&
                                                        'order-first'
                                                )}
                                            >
                                                {sender.toString() === senderId.toString() ? (
                                                    <BsArrow90DegLeft className="fill-white text-2xl" />
                                                ) : (
                                                    <BsArrow90DegRight className="fill-white text-2xl" />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <div
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
                                                {typeof message === 'string' ? <span
                                                    dangerouslySetInnerHTML={{ __html: md.render(message) }}
                                                /> : message}

                                                {sender.toString() ===
                                                    senderId.toString() &&
                                                    status !== 'pending' && (
                                                        <Dropdown
                                                            placement="leftStart"
                                                            style={{
                                                                zIndex: 'auto',
                                                            }}
                                                            renderToggle={
                                                                renderIconButton
                                                            }
                                                            NoCaret
                                                        >
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
                                                            <Dropdown.Item
                                                                onClick={() =>
                                                                    handleQuoteReply(
                                                                        id
                                                                    )
                                                                }
                                                            >
                                                                Quote Reply
                                                            </Dropdown.Item>
                                                            <Dropdown.Item
                                                                onClick={() => startReply(id)}
                                                            >
                                                                Reply
                                                            </Dropdown.Item>
                                                            <Dropdown.Item
                                                                onClick={() =>
                                                                    handleDelete(id)
                                                                }
                                                            >
                                                                Delete
                                                            </Dropdown.Item>
                                                        </Dropdown>
                                                    )}
                                                {sender.toString() !==
                                                    senderId.toString() &&
                                                    status !== 'pending' && (
                                                        <Dropdown
                                                            placement="rightStart"
                                                            style={{
                                                                zIndex: 'auto',
                                                            }}
                                                            renderToggle={
                                                                renderIconButtonReceiver
                                                            }
                                                            NoCaret
                                                        >
                                                            <Dropdown.Item
                                                                onClick={() =>
                                                                    handleCopyToClipBoard(
                                                                        id
                                                                    )
                                                                }
                                                            >
                                                                Copy
                                                            </Dropdown.Item>
                                                            <Dropdown.Item
                                                                onClick={() =>
                                                                    handleQuoteReply(
                                                                        id
                                                                    )
                                                                }
                                                            >
                                                                Quote Reply
                                                            </Dropdown.Item>
                                                            <Dropdown.Item
                                                                onClick={() => startReply(id)}
                                                            >
                                                                Reply
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
                                </div>
                            );
                        }
                    )}

                </ScrollToBottom>
            </div>
            <form
                className="flex flex-col justify-center items-center mt-[40px]"
                onSubmit={handleSubmit}
            >
                {currentReplyMessage && (
                    <div className="w-full p-2 flex items-center justify-between gap-2 border rounded-t-md">
                        <div className="flex items-center gap-2">
                            <IoIosArrowDropright className="fill-white scale-150" />
                            {typeof currentReplyMessage.message !== 'string' ? (
                                <div className="truncate">{currentReplyMessage.message}</div>
                            ) : (
                                <div
                                    className="truncate cursor-pointer"
                                    onClick={() => viewRepliedMessage(currentReplyMessageId)}
                                >
                                    {currentReplyMessage.senderId.toString() === senderId.toString()
                                        ? 'Replying Yourself'
                                        : 'Replying to Buddy'}
                                </div>
                            )}
                        </div>
                        <ImCancelCircle
                            onClick={() => setCurrentReplyMessageId(null)}
                            className="fill-white scale-150 cursor-pointer"
                        />
                    </div>
                )}
                <div className="w-full flex justify-center items-center">
                    <div
                        className={createClassesFromArray(
                            'w-full flex items-center justify-between bg-secondary max-h-[150px]',
                            currentReplyMessage ? 'rounded-bl-md' : 'rounded-l-md'
                        )}
                    >
                        <textarea
                            placeholder="Send a Message....."
                            className="h-[45px] focus:outline-none w-[96%] bg-secondary text-white rounded-[15px] resize-none pl-[22px] pr-[22px] py-[10px] text-[18px] placeholder-shown:align-middle min-h-[40px] max-h-[100px] overflow-y-scroll"
                            ref={inputRef}
                            value={message}
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
                        className={createClassesFromArray(
                            'bg-[#FF9F1C] h-[47px] w-[70px] flex justify-center items-center',
                            currentReplyMessage ? 'rounded-br-md' : 'rounded-r-md'
                        )}
                    >
                        <IoSend className="fill-primary scale-[2]" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chat;
