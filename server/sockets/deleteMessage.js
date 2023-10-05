// Importing constants and utility functions
const { NEW_EVENT_DELETE_MESSAGE } = require("../../constants.json");
const { getActiveUser, removeMessage } = require("../utils/lib");

// Exporting a function that takes a 'socket' object as an argument
module.exports = (socket) => {
  
  // Listening for the event 'NEW_EVENT_DELETE_MESSAGE'
  socket.on(
    NEW_EVENT_DELETE_MESSAGE,
    async ({ id: messageId, chatId }, messageWasDeletedSuccessfully) => {

      // Getting the active user associated with the socket
      const user = getActiveUser({
        socketId: socket.id,
      });

      // Checking if user, messageId, or chatId is missing
      if (!user || !messageId || !chatId) {
        // If any of them is missing, send a failure message
        messageWasDeletedSuccessfully(false);
        return;
      }

      // Attempting to remove the message
      const messageDeleted = await removeMessage(chatId, messageId);

      // Broadcasting the message deletion to all sockets in the chat
      socket.broadcast
        .to(chatId)
        .emit(NEW_EVENT_DELETE_MESSAGE, { id: messageId, chatId });

      // Sending a response indicating if the message was deleted successfully
      messageWasDeletedSuccessfully(messageDeleted);
    }
  );
};
