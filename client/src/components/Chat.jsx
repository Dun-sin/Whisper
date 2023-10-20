/* eslint-disable max-len */
import { useEffect, useRef, useContext, useMemo, useState } from 'react';
import { SocketContext } from 'context/Context';

import ScrollToBottom from 'react-scroll-to-bottom';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

import { v4 as uuid } from 'uuid';
import { throttle } from 'lodash';
import MarkdownIt from 'markdown-it';

import { useChat } from 'src/context/ChatContext';
import { useAuth } from 'src/context/AuthContext';
import { useApp } from 'src/context/AppContext';

import useChatUtils from 'src/lib/chatSocket';
import MessageStatus from './MessageStatus';
import listOfBadWordsNotAllowed from 'src/lib/badWords';
import { useNotification } from 'src/lib/notification';
import {
	NEW_EVENT_DELETE_MESSAGE,
	NEW_EVENT_EDIT_MESSAGE,
	NEW_EVENT_RECEIVE_MESSAGE,
	NEW_EVENT_TYPING,
} from '../../../constants.json';
import { createBrowserNotification } from 'src/lib/browserNotification';

import chatHelper,
{
	adjustTextareaHeight,
	checkPartnerResponse,
	getTime
} from '../lib/chatHelper';

import MessageInput from './Chat/MessageInput';
import DropDownOptions from './Chat/DropDownOption';
import PreviousMessages from './Chat/PreviousMessages';


const inactiveTimeThreshold = 180000; // 3 mins delay
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

    const [focusTextArea, setFocusTextArea] = useState(false)

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
            });
        }

        if (inputRef.current) {
					inputRef.current.value = ''; 
					setMessage(''); 
					inputRef.current.focus();
				}
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
                                    className={`w-full flex text-white ${sender.toString() ===
                                        senderId.toString()
                                        ? 'justify-end'
                                        : 'justify-start'
                                        }`}
                                >
                                    <div className={`flex flex-col mb-[2px] min-w-[10px] mdl:max-w-[80%] max-w-[50%] ${sender.toString() ===
                                        senderId.toString()
                                        ? 'items-end'
                                        : 'items-start'
                                        }`}>
                                        <div
                                            className={`chat bg-red p-3 break-all will-change-auto flex gap-6 items-center text ${sender.toString() ===
                                                senderId.toString() ?
                                                'justify-between bg-secondary rounded-l-md' : 'rounded-r-md'
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
                                                    </Dropdown>
                                                )}
                                        </div>
                                        <div
                                            className={`px-[10px] text-[12px] flex gap-2 items-center ${status === 'failed'
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
                <div className="w-full flex items-center justify-between bg-secondary rounded-l-md max-h-[150px] relative">
                    <textarea
                       placeholder={focusTextArea ? 'Press Ctrl + Enter to send message':'Type a message...'}
                        className="h-[45px] focus:outline-none w-[96%] bg-secondary text-white rounded-[15px] resize-none pl-[22px] pr-[22px] py-[10px] text-[18px] placeholder-shown:align-middle min-h-[40px] max-h-[100px] overflow-y-scroll"
                        ref={inputRef}
                        value={message}
                        onChange={handleTypingStatus}
                        onFocus={() => setFocusTextArea(true)}
                        onBlur={() => setFocusTextArea(false)}
                    />
                    <EmojiPicker
                        onEmojiPick={setMessage}
                        focusInput={() => inputRef.current.focus()}
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
                    className="bg-[#FF9F1C] h-[47px] w-[70px] flex justify-center items-center rounded-r-md"
                >
                    <IoSend className="fill-primary scale-[2]" />
                </button>
            </form>
        </div>
    );
};

export default Chat;
