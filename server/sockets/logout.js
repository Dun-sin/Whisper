const { NEW_EVENT_LOGOUT, NEW_EVENT_INACTIVE } = require("../../constants.json");
const { getActiveUser, delWaitingUser } = require("../utils/lib");

module.exports = (io, socket) => {
  socket.on(NEW_EVENT_LOGOUT, async ({ loginId, email }) => {
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
        io.to(chatId).emit(NEW_EVENT_CLOSE, chatId);
        inactiveList.forEach((emailOrLoginId) => {
          socket.broadcast.to(emailOrLoginId).emit(NEW_EVENT_INACTIVE);
        });
      }
    }
  });
};
