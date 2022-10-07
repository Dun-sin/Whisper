import { createContext, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';

import chatReducer from './reducers/chatReducer';

const initialState = {};

const ChatContext = createContext({
    ...initialState,
    deleteMessage: () => undefined,
    addMessage: () => undefined,
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

    function addMessage({ id, message, time, room }) {
        dispatch({
            type: 'ADD_MESSAGE',
            payload: {
                id,
                message,
                time,
                room,
            },
        });
    }

   

    return (
        <ChatContext.Provider 
        value={{ messages: state, addMessage, deleteMessage }}>
            {children}
        </ChatContext.Provider>
    );
};

// Eslint forced me to do this :(
ChatProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
