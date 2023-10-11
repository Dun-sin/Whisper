import { useChat } from 'src/context/ChatContext';
import { useAuth } from 'src/context/AuthContext';
import { useApp } from 'src/context/AppContext';
import { NEW_EVENT_TYPING } from '../../../constants.json';
import { v4 as uuid } from 'uuid';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import useChatUtils from 'src/lib/chat';
import { createBrowserNotification } from 'src/lib/browserNotification';

export default class ChatHelper {
    constructor(setEditing, socket, inputRef, isQuoteReply, quoteMessage, 
        setIsQuoteReply, setQuoteMessage, editing, lastMessageTime){
        const {
            messages: state,
            addMessage,
            updateMessage,
            removeMessage,
            editText,
        } = useChat();
        const { app } = useApp();
        const { authState, dispatchAuth } = useAuth();
        const { logout } = useKindeAuth();
        const { sendMessage, 
            deleteMessage, editMessage } = useChatUtils(socket);
        
        
        this.inactiveTimeThreshold = 180000 // 3 mins delay
        this.senderId = authState.email ?? authState.loginId;
        this.logout = logout;
        this.authState = authState;
        this.dispatchAuth = dispatchAuth;
        this.setEditing = setEditing;
        this.socket = socket;
        this.inputRef = inputRef;
        this.isQuoteReply = isQuoteReply;
        this.quoteMessage = quoteMessage;
        this.setIsQuoteReply = setIsQuoteReply;
        this.setQuoteMessage = setQuoteMessage;
        this.state = state;
        this.editing = editing;
        this.addMessage = addMessage;
        this.updateMessage = updateMessage;
        this.removeMessage = removeMessage;
        this.editText = editText;
        this.sendMessage = sendMessage;
        this.deleteMessage = deleteMessage;
        this.editMessage = editMessage;
        this.lastMessageTime = lastMessageTime;
        this.app = app;
    };

    logOut(){
        this.dispatchAuth({
            type: 'LOGOUT'
        })
        this.logout();
    };

    getMessage(id){
        if (!this.state[this.app.currentChatId]) {
            return null;
        }

        return this.state[this.app.currentChatId].messages[id];
    };

    messageExists(id){
        return Boolean(this.getMessage(id));
    };
    
    cancelEdit(){
        this.inputRef.current.value = '';
        this.setEditing({ isediting: false, messageID: null });
        this.socket
            .timeout(10000)
            .emit(NEW_EVENT_TYPING, { chatId: this.app.currentChatId, 
                isTyping: false });
    };

    async doSend({
        senderId,
        room,
        tmpId = uuid(),
        message,
        time,
    }){
        try {
            this.addMessage({
                senderId,
                room,
                id: tmpId,
                message,
                time,
                status: 'pending',
            });
        } catch {
            this.logOut();
            return false;
        }

        try {
            const sentMessage = await this.sendMessage({
                senderId,
                message,
                time,
                chatId: room,
            });

            try {
                this.updateMessage(tmpId, sentMessage);
            } catch {
                this.logOut();
                return false;
            }
        } catch (e) {
            try {
                this.updateMessage(tmpId, {
                    senderId,
                    room,
                    id: tmpId,
                    message,
                    time,
                    status: 'failed',
                });
            } catch {
                this.logOut();
            }

            return false;
        }

        return true;
    };

    async handleDelete(id){
        if (!this.messageExists(id)) {
            return;
        }

        const messageObject = this.getMessage(id);
        const { message } = messageObject

        if (message.includes('Warning Message')) {
            return;
        }

        this.updateMessage(id, {
            ...messageObject,
            status: 'pending',
        });

        try {
            const messageDeleted = await this.deleteMessage({
                id,
                chatId: messageObject.room,
            });

            if (!messageDeleted) {
                this.updateMessage(id, messageObject);
                return;
            }

            this.removeMessage(id, messageObject.room);
        } catch {
            this.updateMessage(id, messageObject);
        }
    };

    // Define a new function to handle "Ctrl + Enter" key press
    handleCtrlEnter(e){
        if (e.ctrlKey && e.key === 'Enter') {
            this.handleSubmit(e);
        }
    };

    handleResend(id){
        if (!this.messageExists(id)) {
            return;
        }

        const { senderId, room, message, time } = this.getMessage(id);

        this.doSend({
            senderId,
            room,
            message,
            time,
            tmpId: id,
        });
    };

    handleEdit(id){
        this.inputRef.current.focus();
        const { message } = this.getMessage(id);

        if (message.includes('Warning Message')) {
            this.cancelEdit();
            return;
        }
        this.inputRef.current.value = message;

        this.setEditing({ isediting: true, messageID: id });
    };

    handleQuoteReply(id){
        this.inputRef.current.focus();

        const { message } = this.getMessage(id);
        if (message.includes('Warning Message')) {
            this.cancelEdit();
            return;
        }

        const quotedMessage = `> ${message}
        
`;
        this.inputRef.current.value = quotedMessage;
        this.setIsQuoteReply(true)
        this.setQuoteMessage(quotedMessage)
    };

    
    
    async handleCopyToClipBoard(id){
        const { message } = this.getMessage(id);
        if (message.includes('Warning Message')) {
            return;
        }
        if ('clipboard' in navigator) {
            return await navigator.clipboard.writeText(message);
        } else {
            return document.execCommand('copy', true, message);
        }
    };

    checkPartnerResponse(){
        const currentTime = new Date().getTime();
        const isInactive = this.lastMessageTime && 
            currentTime - this.lastMessageTime > this.inactiveTimeThreshold;
        if (isInactive) {
            createBrowserNotification("your partner isn't responding, want to leave?");
        }
    };
} 