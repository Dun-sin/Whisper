const {
  NEW_EVENT_SEND_MESSAGE,
  NEW_EVENT_SEND_FAILED,
  NEW_EVENT_RECEIVE_MESSAGE,
} = require('../../constants.json');
const { addMessage, getActiveUser } = require('../utils/lib');

// Create an object to store message counts per user
const messageCounts = {};

module.exports = (socket) => {
  socket.on(
    NEW_EVENT_SEND_MESSAGE,
    async ({ senderId, message, time, chatId, containsBadword }, returnMessageToSender) => {
      // Below line is just a failed message simulator for testing purposes.

      // const rndInt = Math.floor(Math.random() * 6) + 1;
      // if (rndInt % 2 !== 0) {
      //   return;
      // }
      const user = getActiveUser({
        socketId: socket.id,
      });

      if (!user) {
        socket.emit(NEW_EVENT_SEND_FAILED, {
          message:
            'Hmmm. It seems your login session has expired. ' +
            'Re-login and try again',
        });
        return;
      }

      // Check the message count for the user
      const userMessageCount = messageCounts[senderId] || 0;

      if (userMessageCount >= 25) {
        // User has exceeded the message limit
        socket.emit(NEW_EVENT_SEND_FAILED, {
          message:
            'You have exceeded the message limit. Please try again later.',
        });
        return;
      }

       /**
       * Cache the sent message in memory a nd persist to db
       */
      const sentMessage = await addMessage(chatId, {
        message,
        time,
        senderId,
        type: 'message',
        containsBadword
      });

      const messageDetails = {
        ...sentMessage,
        room: chatId,
        status: 'sent',
      };

      returnMessageToSender(messageDetails);

      socket.broadcast
        .to(chatId)
        .emit(NEW_EVENT_RECEIVE_MESSAGE, messageDetails);

      // Update the message count for the user
      messageCounts[senderId] = userMessageCount + 1;

      // Reset the count after 1 minute
      setTimeout(() => {
        messageCounts[senderId] = 0;
      }, 60 * 1000);
    }
  );
};
