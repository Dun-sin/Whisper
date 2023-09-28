const { CHAT_EVENTS } = require("../constants");
const { getActiveUser, editMessage } = require("../utils/lib");

module.exports = (socket) => {
  socket.on(
    CHAT_EVENTS.NEW_EVENT_EDIT_MESSAGE,
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
        .emit(CHAT_EVENTS.NEW_EVENT_EDIT_MESSAGE, { id: messageId, chatId, newMessage });
      messageWasEditedSuccessfully(messageEditted);
    }
  );
};
