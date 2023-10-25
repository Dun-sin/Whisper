const { NEW_EVENT_READ_MESSAGE } = require('../../constants.json');
const { getActiveUser, seenMessage } = require('../utils/lib');

module.exports = (socket) => {
  socket.on(
    NEW_EVENT_READ_MESSAGE,
    async ({ messageId, chatId }, messageSuccessfullySeen) => {
      const user = getActiveUser({ socketId: socket.id });

      if (!user || !messageId || !chatId) {
        messageSuccessfullySeen(false);
        return;
      }

      const messageSeen = await seenMessage(chatId, messageId);

      socket.broadcast.to(chatId).emit(NEW_EVENT_READ_MESSAGE, {
        messageId,
        chatId,
      });

      messageSuccessfullySeen(messageSeen);
    }
  );
};
