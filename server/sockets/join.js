const {
  NEW_EVENT_JOIN,
  NEW_EVENT_JOINED,
  NEW_EVENT_CHAT_RESTORE,
} = require('../../constants.json');
const {
  isUserActive,
  addToWaitingList,
  getChat,
  getWaitingUserLen,
  getRandomPairFromWaitingList,
  createChat,
  getActiveUser,
} = require('../utils/lib');

/**
 * this function will be triggred when ever the user from front-end will search
 * for new user to chat.
 *
 * @param {Server} io
 */
const matchMaker = async (io) => {
  while (getWaitingUserLen() > 1) {
    const chat = await createChat(getRandomPairFromWaitingList());

    io.to(chat.id).emit(NEW_EVENT_JOINED, {
      roomId: chat.id,
      userIds: chat.userIds,
    });
  }
};
module.exports = (io, socket) => {
  socket.on(NEW_EVENT_JOIN, ({ loginId, email }) => {
    /**
     * This is necessary to enable us send notifications to users
     * using multiple devices to chat
     */
    socket.join(loginId);
    // Email is possibly null for anonymous users
    if (email) {
      socket.join(email);
    }

    /**
     * First we check if user is already chatting.
     * If user is already chatting, continue chat from where the user left
     */
    if (isUserActive(email ?? loginId)) {
      const user = getActiveUser({
        socketId: socket.id,
        loginId,
        email: email ?? null,
      });

      // First join user to lost chat
      if (!user.socketIds.includes(socket.id)) {
        socket.join(user.currentChatId);
        user.socketConnections.push(socket);
        user.socketIds.push(socket.id);
      }

      const chats = {};

      user.chatIds.forEach((chatId) => {
        chats[chatId] = getChat(chatId);
      });

      // Then return all chat messages
      socket.emit(NEW_EVENT_CHAT_RESTORE, {
        chats,
        currentChatId: user.currentChatId,
      });
      return;
    }

    // User was not having any previous chat. So add to waiting list
    addToWaitingList({ loginId, email, socket });

    // Finally, run matchMaker to pair all users on the waiting list
    void matchMaker(io);
  });
};
