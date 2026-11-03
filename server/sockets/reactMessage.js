const { NEW_EVENT_REACT_MESSAGE } = require('../../constants.json');
const { getActiveUser, reactToMessage } = require('../utils/lib');

const ALLOWED_REACTIONS = new Set(['❤️', '👍', '😂', '😮', '😢', '🔥']);

module.exports = (socket) => {
  socket.on(
    NEW_EVENT_REACT_MESSAGE,
    async ({ messageId, chatId, reaction }, reactionUpdated) => {
      const user = getActiveUser({ socketId: socket.id });

      if (
        !user ||
        !messageId ||
        !chatId ||
        !ALLOWED_REACTIONS.has(reaction)
      ) {
        reactionUpdated(false);
        return;
      }

      let updatedMessage;
      try {
        updatedMessage = await reactToMessage(
          chatId,
          messageId,
          user.emailOrLoginId,
          reaction
        );
      } catch (error) {
        console.error('Error while updating message reaction:', error);
        reactionUpdated(false);
        return;
      }

      if (!updatedMessage) {
        reactionUpdated(false);
        return;
      }

      socket.broadcast
        .to(chatId)
        .emit(NEW_EVENT_REACT_MESSAGE, updatedMessage);
      reactionUpdated(updatedMessage);
    }
  );
};
