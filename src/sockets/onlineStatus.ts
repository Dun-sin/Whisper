import { OnlineStatus } from '@/types/types';
import { Socket } from 'socket.io';

const { NEW_EVENT_ONLINE_STATUS } = require('@/constants.json');

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
