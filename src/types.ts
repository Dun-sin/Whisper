import { ReactNode } from 'react';

export type CloneStateType<T> = T;

export type ProviderType = {
	children: ReactNode;
};

export type SettingsType = {
	theme: boolean;
	notificationsEnabled: boolean;
	notificationVolume: number;
};

export type onlineStatus = Date | string | null;

export type AppType = {
	settings: SettingsType;
	tmpSettings: {};
	currentChatId: string | null;
	isSearching: boolean;
	onlineStatus: onlineStatus;
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
	room?: string | null;
	id?: string | null;
	containsBadword: boolean;
	replyTo: string | null;
	status?: string;
	isEdited?: boolean;
	oldMessages?: Array<String>;
	isRead?: boolean;
};

export type MessageIdType = {
	[id: string]: MessageType;
};

export type ChatType = {
	[id: string]: {
		messages: MessageIdType;
		createdAt: Date;
		userIds: [string, string];
	};
};

export type DialogType = {
	isOpen: boolean;
	text: string;
	handler: (() => void) | null;
	noBtnText?: string;
	yesBtnText?: string;
};

export type isActiveType = 'search' | 'friends' | 'profile' | 'settings';
