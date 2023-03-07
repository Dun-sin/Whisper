const { getActiveUser, delWaitingUser } = require("../utils/lib");

module.exports = (io, socket) => {
  socket.on("logout", async ({ loginId, email }) => {
    const user = getActiveUser({
      socketId: socket.id,
    });

    delWaitingUser(email ?? loginId);

    if (!user) {
      return;
    }

    // User is an anonymous user, so close all active chats
    if (!user.email) {
      for (const chatId of user.chatIds) {
        const inactiveList = await closeChat(chatId);
        io.to(chatId).emit("close", chatId);
        inactiveList.forEach((emailOrLoginId) => {
          socket.broadcast.to(emailOrLoginId).emit("inactive");
        });
      }
    }
  });
};
