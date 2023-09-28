const { CHAT_EVENTS } = require("../constants");

module.exports = (socket) => {
  socket.on(CHAT_EVENTS.NEW_EVENT_TYPING, ({ chatId, isTyping }) => {
    socket.to(chatId).timeout(5000).emit(CHAT_EVENTS.NEW_EVENT_DISPLAY, { isTyping, chatId });
  });
};
