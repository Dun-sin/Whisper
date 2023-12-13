import { Socket } from 'socket.io';

import constants from '@/constants';
import { getActiveUser, chatExists, closeChat } from '@/lib/lib';

const CloseChatHandler = (socket: Socket) => {
  socket.on(
    constants.NEW_EVENT_CLOSE,
    async (
      chatId: string | string[],
      setChatClosed: (arg0: boolean) => void
    ) => {
      const user = getActiveUser({
        socketId: socket.id,
      });

      if (!user || !chatExists(chatId as string)) {
        setChatClosed(false);
        return;
      }

      const inactiveList = await closeChat(chatId as string);

      setChatClosed(true);
      socket.broadcast.to(chatId).emit(constants.NEW_EVENT_CLOSE, chatId);
      inactiveList?.forEach((loginId: string) => {
        socket.broadcast.to(loginId).emit(constants.NEW_EVENT_INACTIVE);
      });
    }
  );
};

export default CloseChatHandler;
