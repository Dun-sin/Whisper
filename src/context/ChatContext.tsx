import {
	createContext,
	useContext,
	useMemo,
	useReducer,
	useState,
} from 'react';

import chatReducer, { initialState } from '@/reducer/chatReducer';
import { useApp } from './AppContext';
import useChatHelper from '@/lib/chatHelper';
import { ChatType, MessageIdType, ProviderType, MessageType } from '@/types';

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

export const ChatContext = createContext<{
	createChat: (
		chatId: string,
		userIds: [string, string],
		messages?: MessageIdType,
		createdAt?: Date,
	) => void;
	messages: ChatType;
	removeMessage: (id: string, chatid: string) => void;
	addMessage: (message: MessageType) => void;
	updateMessage: (message: any) => void;
	closeChat: (chatId: string) => void;
	currentReplyMessage: MessageType | null;
	currentReplyMessageId: string;
	closeAllChats: () => void;
	receiveMessage: (id: string, chatId: string) => void;
	startReply: (messageId: string) => void;
	cancelReply: () => void;
}>({
	messages: initialState,
	addMessage: () => {},
	updateMessage: () => {},
	createChat: () => {},
	removeMessage: () => {},
	closeChat: () => {},
	currentReplyMessage: null,
	currentReplyMessageId: '',
	closeAllChats: () => {},
	receiveMessage: () => {},
	startReply: () => {},
	cancelReply: () => {},
});

export const useChat = () => {
	return useContext(ChatContext);
};

export const ChatProvider = ({ children }: ProviderType) => {
	const { app } = useApp();
	const [state, dispatch] = useReducer(
		chatReducer,
		initialState,
		(defaultState) => {
			try {
				const persistedState = JSON.parse(
					localStorage.getItem('chats') as string,
				);

				if (!persistedState) {
					return defaultState;
				}

				return persistedState;
			} catch {
				return defaultState;
			}
		},
	);
	const { getMessage } = useChatHelper(state, app);

	const [currentReplyMessageId, setCurrentReplyMessageId] =
		useState<string>('');
	// eslint-disable-next-line no-use-before-define
	const currentReplyMessage = useMemo(
		() => getMessage(currentReplyMessageId ?? ''),
		[currentReplyMessageId],
	);

	/**
	 *
	 * @param {Message} message
	 */
	function addMessage(message: MessageType) {
		dispatch({
			type: 'ADD_MESSAGE',
			payload: message,
		});
	}

	/**
	 * @param {Message} message
	 */
	function updateMessage(message: MessageType) {
		dispatch({
			type: 'UPDATE_MESSAGE',
			payload: message,
		});
	}

	/**
	 *
	 * @param {string} chatId
	 * @param {string[]} userIds
	 * @param {{[key: string]: Message}} messages
	 * @param { string | number | Date } createdAt
	 */
	function createChat(
		chatId: string,
		userIds: [string, string],
		messages?: MessageIdType,
		createdAt?: Date,
	) {
		dispatch({
			type: 'CREATE_CHAT',
			payload: { chatId, userIds, messages, createdAt },
		});
	}

	function removeMessage(id: string, chatId: string) {
		dispatch({
			type: 'REMOVE_MESSAGE',
			payload: { id, room: chatId },
		});
	}

	function receiveMessage(id: string, chatId: string) {
		dispatch({
			type: 'RECEIVE_MESSAGE',
			payload: { id, room: chatId },
		});
	}

	function closeChat(chatId: string) {
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

	function startReply(messageId: string) {
		setCurrentReplyMessageId(messageId);
	}

	function cancelReply() {
		setCurrentReplyMessageId('');
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
			}}>
			{children}
		</ChatContext.Provider>
	);
};
