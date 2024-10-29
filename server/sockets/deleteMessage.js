const { NEW_EVENT_DELETE_MESSAGE } = require('../../constants.json');
const { getActiveUser, removeMessage, isMessageEditableOrDeletable } = require('../utils/lib');

module.exports = (socket) => {
  socket.on(
    NEW_EVENT_DELETE_MESSAGE,
    async ({ id: messageId, chatId }, messageWasDeletedSuccessfully) => {
      const user = getActiveUser({
        socketId: socket.id,
      });

      if (!user || !messageId || !chatId) {
        messageWasDeletedSuccessfully(false);
        return;
      }

      // Check if message exists and is within the 15-minute editable window
      if (!isMessageEditableOrDeletable(chatId, messageId)) {
        messageWasDeletedSuccessfully(false);
        return;
      }

      const messageDeleted = await removeMessage(chatId, messageId);

      socket.broadcast
        .to(chatId)
        .emit(NEW_EVENT_DELETE_MESSAGE, { id: messageId, chatId });
      messageWasDeletedSuccessfully(messageDeleted);
    }
  );
};
