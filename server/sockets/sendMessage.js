const { CHAT_EVENTS } = require("../constants");
const { addMessage, getActiveUser } = require("../utils/lib");

module.exports = (socket) => {
  socket.on(
    CHAT_EVENTS.NEW_EVENT_SEND_MESSAGE,
    async ({ senderId, message, time, chatId }, returnMessageToSender) => {
      // Below line is just a failed message simulator for testing purposes.

      // const rndInt = Math.floor(Math.random() * 6) + 1;
      // if (rndInt % 2 !== 0) {
      //   return;
      // }

      const user = getActiveUser({
        socketId: socket.id,
      });

      if (!user) {
        socket.emit(CHAT_EVENTS.NEW_EVENT_SEND_FAILED, {
          message:
            "Hmmm. It seems your login session has expired. " +
            "Re-login and try again",
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
        type: "message",
      });

      const messageDetails = {
        ...sentMessage,
        room: chatId,
        status: "sent",
      };

      returnMessageToSender(messageDetails);

      socket.broadcast.to(chatId).emit(CHAT_EVENTS.NEW_EVENT_RECEIVE_MESSAGE, messageDetails);
    }
  );
};
