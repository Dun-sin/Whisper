import { OnlineStatus } from '@/types/types';
import { Socket } from 'socket.io';

import { NEW_EVENT_ONLINE_STATUS } from '@/constants.json';

const OnlineStatusHandler = (socket: Socket) => {
  socket.on(
    NEW_EVENT_ONLINE_STATUS,
    ({
      onlineStatus,
      chatId,
    }: {
      onlineStatus: OnlineStatus;
      chatId: string;
    }): void => {
      socket.broadcast.to(chatId).emit(NEW_EVENT_ONLINE_STATUS, onlineStatus);
    }
  );
};

export default OnlineStatusHandler;
