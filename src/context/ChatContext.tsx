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

import { MessageIdType, MessageType } from '@/types/types';
import { ProviderType } from '@/types/propstypes';
import { ChatContextType } from '@/types/contextTypes';

export const ChatContext = createContext<ChatContextType>({
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
    defaultState => {
      try {
        const persistedState = JSON.parse(
          localStorage.getItem('chats') as string
        );

        if (!persistedState) {
          return defaultState;
        }

        return persistedState;
      } catch (error) {
        console.error('Error parsing localStorage:', error);
        return defaultState;
      }
    }
  );
  const { getMessage } = useChatHelper(state, app);

  const [currentReplyMessageId, setCurrentReplyMessageId] =
    useState<string>('');
  // eslint-disable-next-line no-use-before-define
  const currentReplyMessage = useMemo(
    () => getMessage(currentReplyMessageId),
    [currentReplyMessageId, getMessage]
  );

  function addMessage(message: MessageType) {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: message,
    });
  }

  function updateMessage(message: MessageType) {
    dispatch({
      type: 'UPDATE_MESSAGE',
      payload: message,
    });
  }

  function createChat(
    chatId: string,
    userIds: [string, string],
    messages: MessageIdType = {},
    createdAt?: Date
  ): void {
    try {
      dispatch({
        type: 'CREATE_CHAT',
        payload: { chatId, userIds, messages, createdAt },
      });
      console.log('context', { chatId, userIds, messages, createdAt });
    } catch (error) {
      console.error('Error creating chat:', error);
    }
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
