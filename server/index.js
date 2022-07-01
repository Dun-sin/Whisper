require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });
const fs = require('fs');

// Mongodb
const mongo = require('mongodb');
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
	User.create(
		{
			_id: req.body.id,
			email: req.body.email,
		},
		(err, data) => {
			if (err) {
				console.log(err);
			} else {
				res.sendStatus(202);
			}
		},
	);
});

app.get('/user/find', (req, res) => {
	User.find(req.query, (err, data) => {
		if (err) {
			console.log(err);
		} else {
			if (data.length === 0) {
				res.sendStatus(202);
			} else {
				const user = {};

				user['id'] = data[0]._id.toString();
				res.status(200).send(JSON.stringify(user));
			}
		}
	});
});

const users = [];

// Sockets
io.on('connection', (socket) => {
	socket.on('adding', (data) => {
		if (data.userID === '') return;
		users.push(data.userID);
		console.log(users);
	});
	socket.on('send_message', ({ senderId, message, time }) => {
		socket.broadcast.emit('receive_message', { senderId, message, time });
	});
});

app.use(cors());

server.listen(4000, () => {
	console.log('on port 4000');
});
