require("dotenv").config();

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const cors = require("cors");
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*" },
  reconnectionAttempts: 5,
});
const HTTP_PORT = process.env.PORT || 4000;

// Mongodb database host connection
const mongoose = require("mongoose");
mongoose.connect(process.env.MongoDB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const User = require("./models/UserSchema");

// Modules
const userModule = require("./users");

app.use(express.json());
app.use(cors());

/*
  @method: post
  @end-point: /user/add
*/
app.post("/user/add", (req, res) => {
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
    }
  );
});

/*
  @method: get
  @end-point: /user/find
*/
app.get("/user/find", (req, res) => {
  User.find(req.query, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      if (data.length === 0) {
        res.sendStatus(202);
      } else {
        const user = {};

        user["id"] = data[0]._id.toString();
        res.status(200).send(JSON.stringify(user));
      }
    }
  });
});

// this function will be triggred when ever the user from front-end will search for new user to chat.
const matchMaker = () => {
  // checking whether user is more than one in waiting list or not.
  if (userModule.getWaitingUserLen() > 1) {
    // getting user socket info form waiting user list and removing it from wating list.
    let user1 = userModule.getUser();
    let user2 = userModule.getUser();
    // creating unique room for users.
    let roomval = user1.id + user2.id;
    // letting user to joing the room.
    user1.join(roomval);
    user2.join(roomval);
    // sending message to users that they have joined the room.
    io.to(roomval).emit("joined", "Searched completed");
    // creating data structure to store user information in specific format.
    let udata1 = {
      id: user1.id,
      room: roomval,
    };
    let udata2 = {
      id: user2.id,
      room: roomval,
    };
    // maintaining the user's room name
    userModule.addUser(udata1);
    userModule.addUser(udata2);

    // maintaining active user's list
    userModule.addActiveUser({ id: udata1 });
    userModule.addActiveUser({ id: udata1 });
  }
};

// Sockets
io.on("connection", (socket) => {
  socket.on("join", () => {
    // whenever user is searching for another user for chat the user socket info will be added to user waiting list.
    userModule.addWaitingUser(socket);
    // if user is more than one in waiting list then it will create room for the two random users.
    matchMaker();
  });

  socket.on("send_message", ({ senderId, message, time }, callback) => {
    let room = userModule.getUserRoom(socket.id);
    io.to(room).emit("receive_message", { senderId, message, time });
  });
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
