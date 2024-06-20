import { createContext, useContext, useMemo, useReducer, useState } from 'react';
import PropTypes from 'prop-types';

import chatReducer from './reducers/chatReducer';
import { useApp } from './AppContext';
import useChatHelper from 'src/lib/chatHelper';

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

export const ChatContext = createContext({
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
	const { app } = useApp();
	const [state, dispatch] = useReducer(chatReducer, initialState, (defaultState) => {
		try {
			const persistedState = JSON.parse(localStorage.getItem('chats'));

			if (!persistedState) {
				return defaultState;
			}

			return persistedState;
		} catch {
			return defaultState;
		}
	});
	const { getMessage } = useChatHelper(state, app);

	const [currentReplyMessageId, setCurrentReplyMessageId] = useState(null);
	// eslint-disable-next-line no-use-before-define
	const currentReplyMessage = useMemo(
		() => getMessage(currentReplyMessageId),
		[currentReplyMessageId]
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
	function updateMessage(message, isEdited) {
		dispatch({
			type: 'UPDATE_MESSAGE',
			payload: { message, isEdited },
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

	function receiveMessage(id, chatId) {
		dispatch({
			type: 'RECEIVE_MESSAGE',
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

	function startReply(messageId) {
		setCurrentReplyMessageId(messageId);
	}

	function cancelReply() {
		setCurrentReplyMessageId(null);
	}

	return (
		<ChatContext.Provider
			value={{
				messages: state,
				currentReplyMessage,
				currentReplyMessageId,
				addMessage,
				updateMessage,
				createChat,
				removeMessage,
				closeChat,
				closeAllChats,
				receiveMessage,
				startReply,
				cancelReply,
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
