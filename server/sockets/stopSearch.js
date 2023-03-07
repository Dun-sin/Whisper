const { delWaitingUser } = require("../lib");

module.exports = (socket) => {
  socket.on("stop_search", async ({ loginId, email }) => {
    await delWaitingUser(email ?? loginId);
    socket.emit("stop_search_success");
  });
};
