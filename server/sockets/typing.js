const { NEW_EVENT_TYPING, NEW_EVENT_DISPLAY } = require('../../constants.json');

module.exports = (socket) => {
  socket.on(NEW_EVENT_TYPING, ({ chatId, isTyping }) => {
    socket
      .to(chatId)
      .timeout(5000)
      .emit(NEW_EVENT_DISPLAY, { isTyping, chatId });
  });
};
