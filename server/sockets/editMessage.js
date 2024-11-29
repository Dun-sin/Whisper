const { NEW_EVENT_EDIT_MESSAGE,FIFTEEN_MINUTES } = require('../../constants.json');
const { getActiveUser, editMessage } = require('../utils/lib');

const isMessageEditableOrDeletable = (time) => {
  return Date.now() - new Date(time).getTime() <= FIFTEEN_MINUTES;
};

module.exports = (socket) => {
  socket.on(
    NEW_EVENT_EDIT_MESSAGE,
    async (
      { id: messageId, chatId, newMessage, oldMessage,time }
    ) => {
      const user =  getActiveUser({
        socketId: socket.id,
      });
      console.log(user)
       if (!user || !messageId || !chatId) {
     //   messageWasEditedSuccessfully(false);
     return;
       }

      // Check if message exists and is within the 15-minute editable window
      if (!isMessageEditableOrDeletable(time)) {
     //   messageWasEditedSuccessfully(false);
        return;
      }

      const messageEdited = await editMessage(chatId, {
        id: messageId,
        message: newMessage,
        oldMessage,
      });
      socket.broadcast.to(chatId).emit(NEW_EVENT_EDIT_MESSAGE, messageEdited);
   //   messageWasEditedSuccessfully(messageEdited);
    }
  );
};
