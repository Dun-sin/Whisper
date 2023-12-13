import events from '@/constants';
import { getActiveUser, delWaitingUser, closeChat } from '@/lib/lib';
import { Server, Socket } from 'socket.io';

const LogOutHandler = (io: Server, socket: Socket) => {
  socket.on(events.NEW_EVENT_LOGOUT, async ({ loginId, email }) => {
    const user = getActiveUser({
      socketId: socket.id,
    });

    delWaitingUser(email ?? loginId);

    if (!user) {
      return;
    }

    // User is an anonymous user, so close all active chats
    if (!user.email) {
      for (const chatId of user.chatIds) {
        const inactiveList = await closeChat(chatId);
        io.to(chatId).emit(events.NEW_EVENT_CLOSE, chatId);
        inactiveList?.forEach(emailOrLoginId => {
          socket.broadcast.to(emailOrLoginId).emit(events.NEW_EVENT_INACTIVE);
        });
      }
    }
  });
};

export default LogOutHandler;
