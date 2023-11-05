import {
  NEW_EVENT_STOP_SEARCH,
  NEW_EVENT_STOP_SEARCH_SUCCESS,
} from '@/constants.json';
import { delWaitingUser } from '@/lib/lib';
import { Socket } from 'socket.io';

const StopSearchHandler = (socket: Socket) => {
  try {
    socket.on(NEW_EVENT_STOP_SEARCH, async ({ loginId, email }) => {
      delWaitingUser(email ?? loginId);
      socket.emit(NEW_EVENT_STOP_SEARCH_SUCCESS);
    });
  } catch (err) {
    console.error(err);
  }
};

export default StopSearchHandler;
