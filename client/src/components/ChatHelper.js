import { NEW_EVENT_TYPING } from '../../../constants.json';
import { v4 as uuid } from 'uuid';


const logOut = (dispatchAuth, logout) => {
    dispatchAuth({
      type: 'LOGOUT'
    });
    logout();
  }

const getMessage = (state, currentChatId, id) => {
    if (!state[currentChatId]) {
        return null;
    }

    return state[currentChatId].messages[id];
};

const messageExists = (state, currentChatId, id) => {
    return Boolean(getMessage(state, currentChatId, id));
};

const cancelEdit = (inputRef, setEditing, socket, appCurrentChatId) => {
    inputRef.current.value = '';
    setEditing({ isediting: false, messageID: null });
    socket
        .timeout(10000)
        .emit(NEW_EVENT_TYPING, { chatId: appCurrentChatId, 
            isTyping: false });
};

const doSend = async ({
    senderId,
    room,
    tmpId = uuid(),
    message,
    time,
}, addMessage, dispatchAuth, logout, sendMessage, updateMessage) => {
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
        logOut(dispatchAuth, logout);
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
            logOut(dispatchAuth, logout);
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
            logOut(dispatchAuth, logout);
        }

        return false;
    }

    return true;
};

const handleResend = (state, currentChatId, id, addMessage,
     dispatchAuth, logout, sendMessage, updateMessage) => {
    if (!messageExists(state, currentChatId, id)) {
      return;
    }
  
    const { senderId, room,
        message, time } = getMessage(state, currentChatId, id);
  
    doSend({
      senderId,
      room,
      message,
      time,
      tmpId: id,
    }, addMessage, dispatchAuth, logout, sendMessage, updateMessage);
  }

const handleDelete = async (state, currentChatId, id, updateMessage,
     deleteMessage, removeMessage ) => {
    if (!messageExists(state, currentChatId, id)) {
        return;
    }

    const messageObject = getMessage(state, currentChatId, id);
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

const handleEdit = (id, inputRef, state, currentChatId, setEditing, socket) => {
    inputRef.current.focus();
    const { message } = getMessage(state, currentChatId, id);

    if (message.includes('Warning Message')) {
        cancelEdit(inputRef, setEditing, socket, currentChatId);
        return;
    }
    inputRef.current.value = message;

    setEditing({ isediting: true, messageID: id });
};

const handleQuoteReply = (id, inputRef, state, currentChatId, setIsQuoteReply,
     setQuoteMessage, setEditing, socket) => {
    inputRef.current.focus();

    const { message } = getMessage(state, currentChatId, id);
    if (message.includes('Warning Message')) {
        cancelEdit(inputRef, setEditing, socket, currentChatId);
        return;
    }

    const quotedMessage = `> ${message}
    
`;
    inputRef.current.value = quotedMessage;
    setIsQuoteReply(true)
    setQuoteMessage(quotedMessage)
};

const handleCopyToClipBoard = async (id, state, currentChatId) => {
    const { message } = getMessage(state, currentChatId, id);
    if (message.includes('Warning Message')) {
        return;
    }
    if ('clipboard' in navigator) {
        return await navigator.clipboard.writeText(message);
    } else {
        return document.execCommand('copy', true, message);
    }
};

const checkPartnerResponse = (lastMessageTime, inactiveTimeThreshold,
     createBrowserNotification) => {
    const currentTime = new Date().getTime();
    const isInactive = lastMessageTime && 
        currentTime - lastMessageTime > inactiveTimeThreshold;
    if (isInactive) {
        createBrowserNotification("your partner isn't responding, want to leave?");
    }
};

export {
    logOut,
    getMessage,
    messageExists,
    cancelEdit,
    handleDelete,
    handleResend,
    handleEdit,
    handleQuoteReply,
    doSend,
    handleCopyToClipBoard,
    checkPartnerResponse
  };
