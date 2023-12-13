import { OnlineStatus } from '@/types/types';
import { Socket } from 'socket.io';

import events from '@/constants';

const OnlineStatusHandler = (socket: Socket) => {
  socket.on(
    events.NEW_EVENT_ONLINE_STATUS,
    ({
      onlineStatus,
      chatId,
    }: {
      onlineStatus: OnlineStatus;
      chatId: string;
    }): void => {
      socket.broadcast
        .to(chatId)
        .emit(events.NEW_EVENT_ONLINE_STATUS, onlineStatus);
    }
  );
};

export default OnlineStatusHandler;
