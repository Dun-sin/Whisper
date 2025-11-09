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
  isUserBlocked,
} = require('../utils/lib');

/**
 * this function will be triggred when ever the user from front-end will search
 * for new user to chat.
 *
 * @param {Server} io
 */

let isMatching = false;

const matchMaker = async (io) => {
  if (isMatching) {
    console.log('MatchMaker already running, skipping...');
    return;
  }

  isMatching = true;
  console.log('MatchMaker started. Waiting users:', getWaitingUserLen());

  try {
    while (getWaitingUserLen() > 1) {
      const users = getRandomPairFromWaitingList();
      console.log('Picked users for pairing:', users.map(u => u.loginId));

      if (!users || users.length < 2) {
        console.log('Not enough users to pair, breaking...');
        break;
      }

      // Check if either user is blocked
      if (await isUserBlocked(users)) {
        console.log('Users are blocked, adding back to waiting list');
        users.forEach(user => addToWaitingList({
          loginId: user.loginId,
          email: user.email,
          socket: user.socketConnections[0],
        }));
        continue;
      }

      const chat = await createChat(users);
      console.log('Chat created with id:', chat.id);

      io.to(chat.id).emit(NEW_EVENT_JOINED, {
        roomId: chat.id,
        userIds: chat.userIds,
      });
    }
  } finally {
    console.log('MatchMaker finished.');
    isMatching = false;
  }
};


module.exports = (io, socket) => {
  socket.on(NEW_EVENT_JOIN, ({ loginId, email }) => {
    /**
     * This is necessary to enable us send notifications to users
     * using multiple devices to chat
     */
      socket.join(email ?? loginId);

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
