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
            console.log({ sentMessage });
            resolve(sentMessage);
          }
        );
    });
  }

  function deleteMessage({ id, roomId }: { id: string; roomId: string }) {
    return new Promise((resolve, reject) => {
      if (!socket?.connected) {
        reject(null);
        return;
      }

      socket
        .timeout(30000)
        .emit(
          events.NEW_EVENT_DELETE_MESSAGE,
          { id, roomId },
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
    roomId,
    newMessage,
    oldMessage,
    isEdited,
  }: {
    id: string;
    roomId: string | null;
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
          { id, roomId, newMessage, oldMessage, isEdited },
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
    roomId,
  }: {
    messageId: string;
    roomId: string;
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
          { messageId, roomId },
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
