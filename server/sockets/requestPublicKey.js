import { NEW_EVENT_REQUEST_PUBLIC_KEY } from '../../constants.json';

module.exports = (socket) => {
    socket.on(NEW_EVENT_REQUEST_PUBLIC_KEY , ({ chatId, publicKey }) => {
      console.log(publicKey);
      socket.broadcast.to(chatId).emit('publicKey', publicKey);
    });
};
  