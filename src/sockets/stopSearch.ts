import events from '@/constants';
import { delWaitingUser } from '@/lib/lib';
import { Socket } from 'socket.io';

const StopSearchHandler = (socket: Socket) => {
  try {
    socket.on(events.NEW_EVENT_STOP_SEARCH, async ({ loginId }) => {
      delWaitingUser(loginId);
      socket.emit(events.NEW_EVENT_STOP_SEARCH_SUCCESS);
    });
  } catch (err) {
    console.error(err);
  }
};

export default StopSearchHandler;
