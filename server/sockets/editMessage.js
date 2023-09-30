const { NEW_EVENT_EDIT_MESSAGE } = require("../../constants.json");
const { getActiveUser, editMessage } = require("../utils/lib");

module.exports = (socket) => {
  socket.on(
    NEW_EVENT_EDIT_MESSAGE,
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
        .emit(NEW_EVENT_EDIT_MESSAGE, { id: messageId, chatId, newMessage });
      messageWasEditedSuccessfully(messageEditted);
    }
  );
};
