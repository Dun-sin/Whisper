const { NEW_EVENT_REQUEST_PUBLIC_KEY } = require('../../constants.json');

// This is used to take public key and private from sender and broadcast it to all receivers
module.exports = (io, socket) => {
  socket.on(NEW_EVENT_REQUEST_PUBLIC_KEY, ({ chatId, publicKey, privateKey }) => {
    console.log(`My Id: ${socket.id}`)
    const keys = { pemPublicKeyString: publicKey, pemPrivateKeyString: privateKey };

    // Check if the socket is already in the room
    const room = io.sockets.adapter.rooms.get(chatId);
    const isSocketInRoom = room && room.has(socket.id);


    console.log("=========before========")
    console.log(room)

    // If the socket is not in the room, add it
    if (!isSocketInRoom) {
        socket.join(chatId);
    }

    console.log("=========after========")
    console.log(room)
    // Broadcast the publicKey event to all clients in the room except the sender
    socket.broadcast.to(chatId).emit('publicKey', keys);
});

};
