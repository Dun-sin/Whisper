const { NEW_EVENT_REQUEST_PUBLIC_KEY } = require('../../constants.json');

// This is used to take public key and private from sender and broadcast it to all receivers
module.exports = (io, socket) => {
  socket.on(NEW_EVENT_REQUEST_PUBLIC_KEY, ({ chatId, publicKey, privateKey }) => {
    const keys = { pemPublicKeyString: publicKey, pemPrivateKeyString: privateKey };

    socket.broadcast.to(chatId).emit('publicKey', keys);
});

};
