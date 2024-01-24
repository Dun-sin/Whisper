import { MutableRefObject } from 'react';
import { Socket } from 'socket.io';

export type IsActiveType = 'search' | 'friends' | 'profile' | 'settings';

export type OnlineStatus = Date | string | null;

export type MessageStatus = 'pending' | 'sent' | 'failed';

export type InputRefType = MutableRefObject<HTMLTextAreaElement | null>;

export type CloneStateType<T> = T;

export type SettingsType = {
  theme: boolean;
  notificationsEnabled: boolean;
  notificationVolume: number;
};

export type AppType = {
  settings: SettingsType;
  tmpSettings: {};
  currentRoomId: string | null;
  isSearching: boolean;
  onlineStatus: OnlineStatus;
  disconnected: boolean;
};

export type AuthType = {
  isLoggedIn: boolean;
  loginType: 'email' | 'anonymous';
  loginId: string;
  email: string | null;
};

export type MessageType = {
  senderId: string;
  message: string;
  time: number;
  roomId?: string | null;
  id?: string | null;
  containsBadword: boolean;
  replyTo: string | null;
  status?: MessageStatus;
  isEdited?: boolean;
  oldMessages?: Array<String>;
  isRead?: boolean;
  type?: string;
};

export type MessageIdType = {
  [id: string]: MessageType;
};

export type ChatType = {
  messages: MessageIdType;
  createdAt: Date | number;
  userIds: [string, string];
};

export type RoomType = {
  [id: string]: ChatType;
};

export type ActiveUserType = {
  id?: string;
  email?: null | string;
  loginId: string;
  socketConnections: Socket[];
  socketIds: string[];
  currentRoomId: null | string;
  rooms: string[];
};

export type activeUserIdType = {
  [id: string]: ActiveUserType;
};

export type userType = {};
