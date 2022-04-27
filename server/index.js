const { Server } = require('socket.io');
const app = require('express')();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const io = new Server(server);

let clients = [];

app.use(cors());

io.on('connection', (socket) => {
	socket.on('message', ({ id = socket.id, message }) => {
		io.emit('message', (id, message));
	});
});

server.listen(4000, () => {
	console.log('connected');
});
