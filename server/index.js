require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });
const cors = require('cors');

// Mongoose
const mongoose = require('mongoose');
mongoose.connect(process.env.MongoDB_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// Schemas
const User = require('./Schemas/userSchema');

app.use(express.json());
app.use(cors());

// Routes
app.post('/user/add', (req, res) => {
	createUser(req.body.email);
});

app.get('/user/find', (req, res) => {
	const result = getUser(req.query);
	console.log(req.query);
	result === 'Failed' ? res.sendStatus(200) : res.sendStatus(202);
});

// Functions for routes
function createUser(email) {
	User.create({ email: email }, (err, data) => {
		if (err) console.log(err);
		console.log(data);
	});
}

function getUser(email) {
	User.find(email, (err, foundUser) => {
		if (err) console.log(err);
		else {
			if (foundUser.listen === 0) {
				return 'Failed';
			}
		}
	});
}

// Sockets

io.on('connection', (socket) => {
	socket.on('send_message', ({ senderId, message, time }) => {
		socket.broadcast.emit('receive_message', { senderId, message, time });
	});
});

app.use(cors());

server.listen(4000, () => {
	console.log('on port 4000');
});
