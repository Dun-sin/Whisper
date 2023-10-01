const { NEW_EVENT_LOGOUT, NEW_EVENT_INACTIVE, NEW_EVENT_CLOSE } = require("../../constants.json");
const { getActiveUser, delWaitingUser, closeChat } = require("../utils/lib");

module.exports = (io, socket) => {
  socket.on(NEW_EVENT_LOGOUT, async ({ loginId, email }) => {
    const user = getActiveUser({
      socketId: socket.id,
    });

    delWaitingUser(email ?? loginId);

    if (!user) {
      return;
    }

    // Close active chats, if user logs out
    for (const chatId of user.chatIds) {
      const inactiveList = await closeChat(chatId);
      io.to(chatId).emit(NEW_EVENT_CLOSE, chatId);
      inactiveList.forEach((emailOrLoginId) => {
        socket.broadcast.to(emailOrLoginId).emit(NEW_EVENT_INACTIVE);
      });
    }
  });
};
