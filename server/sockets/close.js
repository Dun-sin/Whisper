const { CHAT_EVENTS } = require("../constants");
const { getActiveUser, chatExists, closeChat } = require("../utils/lib");

module.exports = (socket) => {
  socket.on(CHAT_EVENTS.NEW_EVENT_CLOSE, async (chatId, setChatClosed) => {
    const user = getActiveUser({
      socketId: socket.id,
    });

    if (!user || !chatExists(chatId)) {
      setChatClosed(false);
      return;
    }

    const inactiveList = await closeChat(chatId);

    setChatClosed(true);
    socket.broadcast.to(chatId).emit(CHAT_EVENTS.NEW_EVENT_CLOSE, chatId);
    inactiveList.forEach((emailOrLoginId) => {
      socket.broadcast.to(emailOrLoginId).emit(CHAT_EVENTS.NEW_EVENT_INACTIVE);
    });
  });
};
