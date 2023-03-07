const { getActiveUser, editMessage } = require("../utils/lib");

module.exports = (socket) => {
  socket.on(
    "edit_message",
    async (
      { id: messageId, chatId, newMessage },
      messageWasEditedSuccessfully
    ) => {
      const user = getActiveUser({
        socketId: socket.id,
      });

      if (!user || !messageId || !chatId) {
        messageWasEditedSuccessfully(false);
        return;
      }

      const messageEditted = await editMessage(chatId, {
        id: messageId,
        message: newMessage,
      });

      socket.broadcast
        .to(chatId)
        .emit("edit_message", { id: messageId, chatId, newMessage });
      messageWasEditedSuccessfully(messageEditted);
    }
  );
};
