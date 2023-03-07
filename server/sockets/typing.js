module.exports = (socket) => {
  socket.on("typing", ({ chatId, isTyping }) => {
    socket.to(chatId).timeout(5000).emit("display", { isTyping, chatId });
  });
};
