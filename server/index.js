const app = require('express')();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

let clients = [];

io.on('connection', (socket) => {
	socket.on('message', ({ id, message }) => {
		io.emit('message', (id, message));
	});
});

app.use(cors());

server.listen(4000, () => {
	console.log('connected');
});
