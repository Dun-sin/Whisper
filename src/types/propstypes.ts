import { Dispatch, SetStateAction, ReactNode } from 'react';

import { DebouncedFunc } from 'lodash';
import { InputRefType } from './types';

export type DropDownProps = {
  id: string;
  inputRef: InputRefType;
  isSender: boolean;
  cancelEdit: () => void;
  setEditing: Dispatch<
    SetStateAction<{
      isediting: boolean;
      messageID: string;
    }>
  >;
  setReplyId: (messageID: string) => void;
};

export type EmojiPickerProps = {
  onEmojiPick: Dispatch<SetStateAction<string>>;
  focusInput: () => void;
};

export type MessageInputProps = {
  inputRef: InputRefType;
  message: string;
  handleTypingStatus: DebouncedFunc<(e: any) => void>;
  setMessage: Dispatch<SetStateAction<string>>;
  editing: {
    isediting: boolean;
    messageID: string;
  };
  cancelEdit: () => void;
  handleSubmit: (e: any) => Promise<void>;
};

export type MessageSeenProps = {
  isRead: boolean;
  isSender: boolean;
};

export type MessageStatusProps = {
  iAmTheSender: boolean;
  time: string;
  status: string;
  onResend: () => void;
};

export type PreviousMessagesProps = {
  id: string;
  isSender: boolean;
  isEdited?: boolean;
  openPreviousEdit: (messageId: any) => void;
  openPreviousMessages: string;
  oldMessages: string[];
};

export type ProviderType = {
  children: ReactNode;
};
