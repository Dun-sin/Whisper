const { CHAT_EVENTS } = require("../constants");
const { getActiveUser, removeMessage } = require("../utils/lib");

module.exports = (socket) => {
  socket.on(
    CHAT_EVENTS.NEW_EVENT_DELETE_MESSAGE,
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
        .emit(CHAT_EVENTS.NEW_EVENT_DELETE_MESSAGE, { id: messageId, chatId });
      messageWasDeletedSuccessfully(messageDeleted);
    }
  );
};
