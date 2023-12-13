import events from '@/constants';
import { getActiveUser, editMessage } from '@/lib/lib';
import { Socket } from 'socket.io';

const EditMessageHandler = (socket: Socket) => {
  socket.on(
    events.NEW_EVENT_EDIT_MESSAGE,
    async (
      { id: messageId, chatId, newMessage, oldMessage },
      messageWasEditedSuccessfully
    ) => {
      const user = getActiveUser({
        socketId: socket.id,
      });

      if (!user || !messageId || !chatId) {
        messageWasEditedSuccessfully(false);
        return;
      }

      const messageEdited = await editMessage(chatId, {
        id: messageId,
        message: newMessage,
        oldMessage,
      });
      socket.broadcast
        .to(chatId)
        .emit(events.NEW_EVENT_EDIT_MESSAGE, messageEdited);
      messageWasEditedSuccessfully(messageEdited);
    }
  );
};

export default EditMessageHandler;
