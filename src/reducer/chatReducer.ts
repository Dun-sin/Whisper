import { cloneState } from '@/lib/utils';
import { RoomType } from '@/types/types';

const messageInitial = {
  message: '',
  time: '',
  senderId: '',
  id: '',
  status: '',
  roomId: '',
  containsBadword: false,
  replyTo: '',
  isEdited: false,
  oldMessages: [],
  isRead: false,
};
export const initialState: RoomType = {};

export default function chatReducer(state: RoomType, action: any) {
  const clonedState = cloneState(state);
  switch (action.type) {
    case 'CREATE_CHAT': {
      const {
        roomId,
        userIds,
        messages = messageInitial,
        createdAt = new Date(),
      } = action.payload;

      console.log('context', { roomId, userIds });
      clonedState[roomId] = {
        userIds,
        messages,
        createdAt,
      };

      break;
    }

    case 'CLOSE_CHAT': {
      const { roomId } = action.payload;

      delete clonedState[roomId];
      break;
    }

    case 'CLOSE_ALL_CHATS': {
      for (const roomId in clonedState) {
        delete clonedState[roomId];
      }
      break;
    }

    case 'ADD_MESSAGE': {
      const {
        senderId,
        roomId,
        id,
        message,
        time,
        status,
        containsBadword,
        replyTo,
      } = action.payload || {};

      if (!clonedState[roomId]) {
        throw new Error('Room not found!');
      }

      clonedState[roomId].messages[id] = {
        senderId,
        roomId,
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
      if (!clonedState[message.roomId]) {
        throw new Error('Room not found!');
      }

      if (id !== message.id) {
        delete clonedState[message.roomId].messages[id];
      }

      const roomId = message.roomId;
      const messageId = message.id;
      const updatedMessage = message;
      const oldMessages = message.oldMessages;

      // Assign the message to the cloned state
      clonedState[roomId].messages[messageId] = updatedMessage;

      // Update the 'isEdited' property
      if (message.isEdited === undefined || message.isEdited === null) {
        break;
      }
      clonedState[roomId].messages[messageId].isEdited = message.isEdited;

      if (oldMessages.length === 0) {
        break;
      }

      clonedState[roomId].messages[messageId].oldMessages = oldMessages;
      break;
    }

    case 'REMOVE_MESSAGE': {
      const { id, roomId } = action.payload;

      if (!clonedState[roomId]) {
        break;
      }

      delete clonedState[roomId].messages[id];
      break;
    }

    case 'RECEIVE_MESSAGE': {
      const { id, roomId } = action.payload;

      if (!clonedState[roomId]) {
        break;
      }

      if (clonedState[roomId].messages[id].isRead) {
        break;
      }
      clonedState[roomId].messages[id].isRead = true;
      break;
    }

    case 'EDIT_TEXT': {
      const { id, roomId, newText, oldMessage } = action.payload;
      if (!clonedState[roomId]) {
        break;
      }

      clonedState[roomId].messages[id].message = newText;
      clonedState[roomId].messages[id].isEdited = true;
      if (!Array.isArray(clonedState[roomId].messages[id].oldMessages)) {
        clonedState[roomId].messages[id].oldMessages = [];
      }
      clonedState[roomId].messages[id].oldMessages?.push(oldMessage);
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
