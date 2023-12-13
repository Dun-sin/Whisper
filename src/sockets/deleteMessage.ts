import events from '@/constants';
import { getActiveUser, removeMessage } from '@/lib/lib';
import { Socket } from 'socket.io';

const DeleteManagerHandler = (socket: Socket) => {
  socket.on(
    events.NEW_EVENT_DELETE_MESSAGE,
    async ({ id: messageId, chatId }, messageWasDeletedSuccessfully) => {
      const user = getActiveUser({
        socketId: socket.id,
      });

      if (!user || !messageId || !chatId) {
        messageWasDeletedSuccessfully(false);
        return;
      }

      const messageDeleted = await removeMessage(chatId, messageId);

      socket.broadcast
        .to(chatId)
        .emit(events.NEW_EVENT_DELETE_MESSAGE, { id: messageId, chatId });
      messageWasDeletedSuccessfully(messageDeleted);
    }
  );
};

export default DeleteManagerHandler;
