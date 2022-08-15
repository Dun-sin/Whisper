require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const { Server } = require('socket.io');
const io = new Server(server, {
	cors: { origin: '*' },
	reconnectionAttempts: 5,
});
const HTTP_PORT = process.env.PORT || 4000;

// Mongodb database host connection
const mongoose = require('mongoose');
mongoose.connect(process.env.MongoDB_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// User Schema
const User = require('./models/UserSchema');

// Modules
const userModule = require('./users');

app.use(express.json());
app.use(cors());

/*
  @method: post
  @end-point: /user/add
*/
app.post('/user/add', (req, res) => {
	User.create(
		{
			email: req.body.email,
		},
		(err, data) => {
			if (err) {
				console.log(err);
			} else {
				res.status(202).json(data);
			}
		},
	);
});


/*
  @method: get
  @end-point: /user/find
*/
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

let waitingUser = {}

const matchMaker = () => {
	setInterval(() => {
		if(userModule.getWaitingUserLen() > 1){
			let keys = userModule.getWaitingUserKeys()
			let roomval = userModule.getWaitingUserKeys()[0] + userModule.getWaitingUserKeys()[1]
			userModule.getWaitingUser(keys[0]).join(roomval)
			userModule.getWaitingUser(keys[1]).join(roomval)
			io.to(roomval).emit('joined',"Searched completed")
			userModule.getWaitingUser(keys[0])
			let udata1 = {
				id : keys[0],
				room : roomval
			}
			let udata2 = {
				id : keys[1],
				room : roomval
			}
			userModule.addUser(udata1)
			userModule.addUser(udata2)
			userModule.addActiveUser({ id : keys[0] })
			userModule.addActiveUser({ id : keys[1] })
			userModule.delWaitingUser(keys[0])
			userModule.delWaitingUser(keys[1])
			console.log("running again n again",userModule.getWaitingUserLen(),keys)
		}
	},3000)
}
matchMaker()
// Sockets
io.on('connection', (socket) => {
	
	socket.on('join',() => {
		userModule.addWaitingUser(socket)
	})

	socket.on('pmessage',(message,callback) => {
		console.log("Getting message",message)
		let room = userModule.getUserRoom(socket.id)
		io.to(room).emit('pmessage',message)
	})
	// socket.on('adding', (data) => {
	// 	if (data.userID.ID === '') return;
	// 	userModule.allUsers(data.userID.ID);
	// });

	// socket.on('createRoom', () => {
	// 	userModule.matchUsers(socket);
	// });

	// socket.on('send_message', ({ senderId, message, time }) => {
	// 	socket.broadcast.emit('receive_message', { senderId, message, time });
	// });
});

app.use(cors());

server.listen(HTTP_PORT, () => {
	console.log(`on port ${HTTP_PORT}`);
});
