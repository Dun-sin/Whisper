import { Dispatch } from 'react';
import {
  AppType,
  AuthType,
  ChatIdType,
  MessageIdType,
  MessageType,
  SettingsType,
} from './types';

export type DialogType = {
  isOpen: boolean;
  text: string;
  handler: (() => void) | null;
  noBtnText?: string;
  yesBtnText?: string;
};

export type ChatContextType = {
  createChat: (
    chatId: string,
    userIds: [string, string],
    messages?: MessageIdType,
    createdAt?: Date
  ) => any;
  messages: ChatIdType;
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
};

export type AppContextType = {
  app: AppType;
  hasUnsavedSettings: boolean;
  updateSettings: () => undefined;
  updateTmpSettings: (newSettings: SettingsType) => void;
  cancelSettingsUpdate: () => void;
  startSearch: () => undefined;
  endSearch: (currentChatId: null | string) => undefined;
  loadUserSettings: (settings: SettingsType) => void;
  updateOnlineStatus: (onlineStatus: Date | string | null) => void;
  updateConnection: (isDisconnected: boolean) => void;
};

export type AuthContextType = {
  authState: AuthType;
  dispatchAuth: Dispatch<any>;
  isLoggedIn: boolean;
};
