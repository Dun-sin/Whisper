const {
  NEW_EVENT_CLOSE,
  NEW_EVENT_INACTIVE,
  NEW_EVENT_CLOSED,
} = require('../../constants.json');
const { getActiveUser, chatExists, closeChat } = require('../utils/lib');

module.exports = (socket) => {
  socket.on(NEW_EVENT_CLOSE, async (chatId, setChatClosed) => {
    const user = getActiveUser({
      socketId: socket.id,
    });

    if (!user || !chatExists(chatId)) {
      setChatClosed(false);
      return;
    }

    const inactiveList = await closeChat(chatId);

    setChatClosed(true);
    socket.broadcast.to(chatId).emit(NEW_EVENT_CLOSED, chatId);
    inactiveList.forEach((emailOrLoginId) => {
      socket.broadcast.to(emailOrLoginId).emit(NEW_EVENT_INACTIVE);
    });
  });
};
