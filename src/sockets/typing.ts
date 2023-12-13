import { Socket } from 'socket.io';

import events from '@/constants';

const TypingHandler = (socket: Socket) => {
  socket.on(events.NEW_EVENT_TYPING, ({ chatId, isTyping }) => {
    socket
      .to(chatId)
      .timeout(5000)
      .emit(events.NEW_EVENT_DISPLAY, { isTyping, chatId });
  });
};

export default TypingHandler;
