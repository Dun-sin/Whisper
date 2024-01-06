import { cloneState } from '@/lib/utils';
import { ChatIdType } from '@/types/types';

const messageInitial = {
  message: '',
  time: '',
  senderId: '',
  id: '',
  status: '',
  room: '',
  containsBadword: false,
  replyTo: '',
  isEdited: false,
  oldMessages: [],
  isRead: false,
};
export const initialState: ChatIdType = {};

export default function chatReducer(state: ChatIdType, action: any) {
  const clonedState = cloneState(state);
  switch (action.type) {
    case 'CREATE_CHAT': {
      const {
        chatId,
        userIds,
        messages = messageInitial,
        createdAt = new Date(),
      } = action.payload;

      console.log('context', { chatId, userIds });
      clonedState[chatId] = {
        userIds,
        messages,
        createdAt,
      };

      break;
    }

    case 'CLOSE_CHAT': {
      const { chatId } = action.payload;

      delete clonedState[chatId];
      break;
    }

    case 'CLOSE_ALL_CHATS': {
      for (const chatId in clonedState) {
        delete clonedState[chatId];
      }
      break;
    }

    case 'ADD_MESSAGE': {
      const {
        senderId,
        room,
        id,
        message,
        time,
        status,
        containsBadword,
        replyTo,
      } = action.payload || {};

      if (!clonedState[room]) {
        throw new Error('Room not found!');
      }

      clonedState[room].messages[id] = {
        senderId,
        room,
        id,
        message,
        time,
        status,
        containsBadword,
        replyTo,
        oldMessages: [],
        isEdited: false,
        isRead: false,
      };
      break;
    }

    case 'UPDATE_MESSAGE': {
      const message = action.payload;

      const id = message.id;
      if (!clonedState[message.room]) {
        throw new Error('Room not found!');
      }

      if (id !== message.id) {
        delete clonedState[message.room].messages[id];
      }

      const room = message.room;
      const messageId = message.id;
      const updatedMessage = message;
      const oldMessages = message.oldMessages;

      // Assign the message to the cloned state
      clonedState[room].messages[messageId] = updatedMessage;

      // Update the 'isEdited' property
      if (message.isEdited === undefined || message.isEdited === null) {
        break;
      }
      clonedState[room].messages[messageId].isEdited = message.isEdited;

      if (oldMessages.length === 0) {
        break;
      }

      clonedState[room].messages[messageId].oldMessages = oldMessages;
      break;
    }

    case 'REMOVE_MESSAGE': {
      const { id, room } = action.payload;

      if (!clonedState[room]) {
        break;
      }

      delete clonedState[room].messages[id];
      break;
    }

    case 'RECEIVE_MESSAGE': {
      const { id, room } = action.payload;

      if (!clonedState[room]) {
        break;
      }

      if (clonedState[room].messages[id].isRead) {
        break;
      }
      clonedState[room].messages[id].isRead = true;
      break;
    }

    case 'EDIT_TEXT': {
      const { id, room, newText, oldMessage } = action.payload;
      if (!clonedState[room]) {
        break;
      }

      clonedState[room].messages[id].message = newText;
      clonedState[room].messages[id].isEdited = true;
      if (!Array.isArray(clonedState[room].messages[id].oldMessages)) {
        clonedState[room].messages[id].oldMessages = [];
      }
      clonedState[room].messages[id].oldMessages?.push(oldMessage);
      break;
    }
    default:
      console.warn('Unhandled action type:', action.type);
      return clonedState;
  }

  // Save auth state to localStorage on each change
  localStorage.setItem('chats', JSON.stringify(clonedState));

  return clonedState;
}
