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
        if (typeof window !== 'undefined') {
          const persistedState = JSON.parse(
            localStorage.getItem('chats') as string
          );

          if (!persistedState) {
            return defaultState;
          }

          return persistedState;
        } else {
          return defaultState;
        }
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

  const functions = {
    addMessage: (message: MessageType) => {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: message,
      });
    },
    updateMessage: (message: MessageType) => {
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: message,
      });
    },
    createChat: (
      chatId: string,
      userIds: [string, string],
      messages: MessageIdType = {},
      createdAt?: Date
    ): any => {
      try {
        dispatch({
          type: 'CREATE_CHAT',
          payload: { chatId, userIds, messages, createdAt },
        });
        console.log('context', { chatId, userIds, messages, createdAt });
        return { chatId, userIds };
      } catch (error) {
        console.error('Error creating chat:', error);
        return { error };
      }
    },
    removeMessage: (id: string, chatId: string) => {
      dispatch({
        type: 'REMOVE_MESSAGE',
        payload: { id, room: chatId },
      });
    },
    receiveMessage: (id: string, chatId: string) => {
      dispatch({
        type: 'RECEIVE_MESSAGE',
        payload: { id, room: chatId },
      });
    },
    closeChat: (chatId: string) => {
      dispatch({
        type: 'CLOSE_CHAT',
        payload: { chatId },
      });
    },
    closeAllChats: () => {
      dispatch({
        type: 'CLOSE_ALL_CHATS',
        payload: {},
      });
    },
    startReply: (messageId: string) => {
      setCurrentReplyMessageId(messageId);
    },
    cancelReply: () => {
      setCurrentReplyMessageId('');
    },
  };

  return (
    <ChatContext.Provider
      value={{
        messages: state,
        currentReplyMessage,
        currentReplyMessageId,
        ...functions,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
