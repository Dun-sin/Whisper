const { addMessage, getActiveUser } = require("../utils/lib");

module.exports = (socket) => {
  socket.on(
    "send_message",
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
        socket.emit("send_failed", {
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

      socket.broadcast.to(chatId).emit("receive_message", messageDetails);
    }
  );
};
