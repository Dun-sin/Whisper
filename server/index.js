const app = require('express')();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

let clients = [];

io.on('connection', (socket) => {
	console.log('connected');
	socket.on('send_message', ({ senderId, message, time }) => {
		socket.broadcast.emit('receive_message', { senderId, message, time });
	});
});

app.use(cors());

server.listen(4000, () => {
	console.log('on port 4000');
});
