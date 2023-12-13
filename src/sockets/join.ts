import events from '@/constants';
import {
  isUserActive,
  addToWaitingList,
  getChat,
  getWaitingUserLen,
  getRandomPairFromWaitingList,
  createChat,
  getActiveUser,
} from '@/lib/lib';
import { ChatIdType } from '@/types/types';
import { Server, Socket } from 'socket.io';

/**
 * this function will be triggred when ever the user from front-end will search
 * for new user to chat.
 */
const matchMaker = async (io: Server) => {
  while (getWaitingUserLen() > 1) {
    const chat = await createChat(getRandomPairFromWaitingList());
    const roomId: string = chat.id as unknown as string;
    io.to(roomId).emit(events.NEW_EVENT_JOINED, {
      roomId: chat.id,
      userIds: chat.userIds,
    });
  }
};
const JoinHandler = (io: Server, socket: Socket) => {
  socket.on(events.NEW_EVENT_JOIN, ({ loginId, email }) => {
    /**
     * This is necessary to enable us send notifications to users
     * using multiple devices to chat
     */
    socket.join(loginId);

    /**
     * First we check if the user is already chatting.
     * If the user is already chatting, continue the chat from where the user left
     */
    if (isUserActive(loginId)) {
      const user = getActiveUser({
        socketId: socket.id,
        loginId,
        email: email ?? null,
      });

      // First join the user to the last chat
      if (!user?.socketIds.includes(socket.id)) {
        socket.join(user?.currentChatId as string);
        user?.socketConnections.push(socket);
        user?.socketIds.push(socket.id);
      }

      const chats: ChatIdType = {};

      user?.chatIds.forEach(chatId => {
        chats[chatId] = getChat(chatId);
      });

      // Then return all chat messages
      socket.emit(events.NEW_EVENT_CHAT_RESTORE, {
        chats,
        currentChatId: user?.currentChatId,
      });
      return;
    }

    // The user was not having any previous chat. So add to the waiting list
    addToWaitingList({ loginId, email, socket });

    // Finally, run matchMaker to pair all users on the waiting list
    matchMaker(io);
  });
};

export default JoinHandler;
