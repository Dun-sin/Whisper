const { getActiveUser, chatExists, closeChat } = require("../utils/lib");

module.exports = (socket) => {
  socket.on("close", async (chatId, setChatClosed) => {
    const user = getActiveUser({
      socketId: socket.id,
    });

    if (!user || !chatExists(chatId)) {
      setChatClosed(false);
      return;
    }

    const inactiveList = await closeChat(chatId);

    setChatClosed(true);
    socket.broadcast.to(chatId).emit("close", chatId);
    inactiveList.forEach((emailOrLoginId) => {
      socket.broadcast.to(emailOrLoginId).emit("inactive");
    });
  });
};
