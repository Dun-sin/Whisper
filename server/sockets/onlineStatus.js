const { NEW_EVENT_ONLINE_STATUS } = require('../../constants.json');

module.exports = (socket) => {
  socket.on(NEW_EVENT_ONLINE_STATUS, ({ onlineStatus, chatId }) => {
    socket.broadcast.to(chatId).emit(NEW_EVENT_ONLINE_STATUS, onlineStatus);
  });
};
