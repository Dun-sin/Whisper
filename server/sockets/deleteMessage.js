const { getActiveUser, removeMessage } = require("../utils/lib");

module.exports = (socket) => {
  socket.on(
    "delete_message",
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
        .emit("delete_message", { id: messageId, chatId });
      messageWasDeletedSuccessfully(messageDeleted);
    }
  );
};
