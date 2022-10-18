import { createContext, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';

import chatReducer from './reducers/chatReducer';

/**
 * @typedef {'pending' | 'sent' | 'failed'} MessageStatus
 *
 * @typedef {{
 *     senderId: string,
 *     room: string,
 *     id: string,
 *     message: string,
 *     time: number | string,
 *     status: MessageStatus,
 * }} Message
 */

const initialState = {};

const ChatContext = createContext({
    ...initialState,
    deleteMessage: () => undefined,
    addMessage: () => undefined,
    updateMessage: () => undefined,
    createChat: () => undefined,
    removeMessage: () => undefined,
    closeChat: () => undefined,
});

export const useChat = () => {
    return useContext(ChatContext);
};

export const ChatProvider = ({ children }) => {
    const [state, dispatch] = useReducer(
        chatReducer,
        initialState,
        (defaultState) => {
            try {
                const persistedState = JSON.parse(
                    localStorage.getItem('chats')
                );

                if (!persistedState) {
                    return defaultState;
                }

                return persistedState;
            } catch {
                return defaultState;
            }
        }
    );

    /**
     *
     * @param {Message} message
     */
    function addMessage(message) {
        dispatch({
            type: 'ADD_MESSAGE',
            payload: message,
        });
    }

    /**
     * @param {string} id
     * @param {Message} message
     */
    function updateMessage(id, message) {
        dispatch({
            type: 'UPDATE_MESSAGE',
            payload: { id, message },
        });
    }

    /**
     *
     * @param {string} chatId
     * @param {string[]} userIds
     * @param {{[key: string]: Message}} messages
     * @param { string | number | Date } createdAt
     */
    function createChat(chatId, userIds, messages, createdAt) {
        dispatch({
            type: 'CREATE_CHAT',
            payload: { chatId, userIds, messages, createdAt },
        });
    }

    function removeMessage(id, chatId) {
        dispatch({
            type: 'REMOVE_MESSAGE',
            payload: { id, room: chatId },
        });
    }

    function closeChat(chatId) {
        dispatch({
            type: 'CLOSE_CHAT',
            payload: { chatId },
        });
    }

    function closeAllChats() {
        dispatch({
            type: 'CLOSE_ALL_CHATS',
            payload: {},
        });
    }

    return (
        <ChatContext.Provider
            value={{
                messages: state,
                addMessage,
                updateMessage,
                createChat,
                removeMessage,
                closeChat,
                closeAllChats,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

// Eslint forced me to do this :(
ChatProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
