/**
 * @typedef {import('socket.io-client').Socket} Socket
 */
import events from '@/shared/constants/constants';
import { MessageType } from '@/types/types';
import { Socket } from 'socket.io-client';

export default function useChatUtils(socket: Socket | undefined) {
  function sendMessage(message: MessageType): Promise<MessageType> {
    return new Promise((resolve, reject) => {
      if (!socket?.connected) {
        reject(null);
        return;
      }

      socket
        .timeout(30000)
        .emit(
          events.NEW_EVENT_SEND_MESSAGE,
          message,
          (err: any, sentMessage: MessageType) => {
            if (err) {
              reject(err);
              return;
            }

            resolve(sentMessage);
          }
        );
    });
  }

  function deleteMessage({ id, room }: { id: string; room: string }) {
    return new Promise((resolve, reject) => {
      if (!socket?.connected) {
        reject(null);
        return;
      }

      socket
        .timeout(30000)
        .emit(
          events.NEW_EVENT_DELETE_MESSAGE,
          { id, room },
          (err: any, messageDeleted: any) => {
            if (err) {
              reject(err);
              return;
            }

            resolve(messageDeleted);
          }
        );
    });
  }

  function editMessage({
    id,
    room,
    newMessage,
    oldMessage,
    isEdited,
  }: {
    id: string;
    room: string | null;
    newMessage: string;
    oldMessage: string | undefined;
    isEdited?: boolean;
  }): Promise<MessageType> {
    return new Promise((resolve, reject) => {
      if (!socket?.connected) {
        reject(null);
        return;
      }

      socket
        .timeout(30000)
        .emit(
          events.NEW_EVENT_EDIT_MESSAGE,
          { id, room, newMessage, oldMessage, isEdited },
          (err: any, messageEdited: MessageType) => {
            if (err) {
              reject(err);
              return;
            }

            resolve(messageEdited);
          }
        );
    });
  }

  function seenMessage({
    messageId,
    room,
  }: {
    messageId: string;
    room: string;
  }) {
    return new Promise((resolve, reject) => {
      if (!socket?.connected) {
        reject(null);
        return;
      }

      socket
        .timeout(30000)
        .emit(
          events.NEW_EVENT_READ_MESSAGE,
          { messageId, room },
          (err: any, messagedRead: any) => {
            if (err) {
              reject(err);
              return;
            }

            resolve(messagedRead);
          }
        );
    });
  }

  return {
    sendMessage,
    deleteMessage,
    editMessage,
    seenMessage,
  };
}
