const app = require('express')();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

let clients = [];

io.on('connection', (socket) => {
	console.log('connected');
	socket.on('message', ({ senderId, message }) => {
		// io.emit('message', (id, message));
		socket.broadcast.emit('recieve', { senderId, message });
	});
});

app.use(cors());

server.listen(4000, () => {
	console.log('on port 4000');
});
