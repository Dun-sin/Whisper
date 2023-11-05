import { Socket } from 'socket.io';

import { NEW_EVENT_TYPING, NEW_EVENT_DISPLAY } from '@/constants.json';

const TypingHandler = (socket: Socket) => {
  socket.on(NEW_EVENT_TYPING, ({ chatId, isTyping }) => {
    socket
      .to(chatId)
      .timeout(5000)
      .emit(NEW_EVENT_DISPLAY, { isTyping, chatId });
  });
};

export default TypingHandler;
