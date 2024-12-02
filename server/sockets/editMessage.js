const { NEW_EVENT_EDIT_MESSAGE } = require('../../constants.json');
const { getActiveUser, editMessage, isMessageEditableOrDeletable } = require('../utils/lib');

module.exports = (socket) => {
  socket.on(
    NEW_EVENT_EDIT_MESSAGE,
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

      // Check if message exists and is within the 15-minute editable window
      if (!isMessageEditableOrDeletable(chatId, messageId)) {
        messageWasEditedSuccessfully(false);
        return;
      }

      const messageEdited = await editMessage(chatId, {
        id: messageId,
        message: newMessage,
        oldMessage,
      });
      socket.broadcast.to(chatId).emit(NEW_EVENT_EDIT_MESSAGE, messageEdited);
      messageWasEditedSuccessfully(messageEdited);
    }
  );
};
