require("dotenv").config();

const validator = require("validator").default;
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
const uuid = require("uuid");

// Mongodb database host connection
const mongoose = require("mongoose");
mongoose.connect(process.env.MongoDB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const User = require("./models/UserSchema");

// Modules
const {
  getWaitingUserLen,
  getUser,
  addUser,
  addActiveUser,
  addWaitingUser,
  getUserRoom,
  getRandomPairFromWaitingList,
  isUserActive,
  getActiveUser,
  addToWaitingList,
} = require("./users");

app.use(express.json());
app.use(cors());

app.post("/login", async (req, res) => {
  const { email } = req.body;

  if (typeof email !== "string" || !validator.isEmail(email)) {
    res.status(406).json({
      message: "Email is invalid",
    });

    return;
  }

  try {
    let user = await User.find({ email });

    if (!user) {
      user = await User.create({ email });
    }

    res.status(200).json({
      id: user._id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "An error occured whiles logging in",
    });
  }
});

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

/**
 * this function will be triggred when ever the user from front-end will search
 * for new user to chat.
 *
 * @param {Server} io
 */
const matchMaker = (io) => {
  while (getWaitingUserLen() > 1) {
    const pairedUsers = getRandomPairFromWaitingList();

    const [user1, user2] = pairedUsers;

    // TODO: Generate a unique roomId using uuid npm library
    const newRoomId =
      user1.emailOrLoginId.toString() + user2.emailOrLoginId.toString();
    const chat = {
      id: newRoomId,
      userIds: [],
      messages: [],
      createdAt: new Date(),
    };

    pairedUsers.forEach((user) => {
      chat.userIds.push(user.emailOrLoginId);
      user.currentChatId = newRoomId;
      user.chats[newRoomId] = chat;
      user.socketConnections.map((socket) => {
        socket.join(newRoomId);
      });

      addActiveUser(user);
    });

    io.to(newRoomId).emit("joined", {
      roomId: newRoomId,
    });
  }
};

// Sockets
io.on("connection", (socket) => {
  /**
   * This event is emitted once the user clicks on the Start button or
   * navigates to the /founduser route
   */
  socket.on("join", ({ loginId, email }) => {
    /**
     * This is necessary to enable us send notifications to users
     * using multiple devices to chat
     */
    socket.join(loginId);
    // Email is possibly null for anonymous users
    if (email) {
      socket.join(email);
    }

    /**
     * First we check if user is already chatting.
     * If user is already chatting, continue chat from where the user left
     */
    if (isUserActive(email ?? loginId)) {
      const user = getActiveUser({
        socketId: socket.id,
        loginId,
        email: email ?? null,
      });

      // First join user to lost chat
      socket.join(user.currentChatId);
      user.socketConnections.push(socket);
      user.socketIds.push(socket.id);

      // Then return all chat messages
      socket.emit("chat_restore", {
        chats: user.chats,
        currentChatId: user.currentChatId,
      });
      return;
    }

    // User was not having any previous chat. So add to waiting list
    addToWaitingList({ loginId, email, socket });

    // Finally, run matchMaker to pair all users on the waiting list
    matchMaker(io);
  });

  socket.on("send_message", ({ senderId, message, time }, callback) => {
    const user = getActiveUser({
      socketId: socket.id,
    });

    if (!user) {
      socket.emit("send_failed", {
        message:
          "Hmmm. It seems your login session has expired. " +
          "Re-login and try again",
        messageId: id,
      });
    }

    const id = uuid.v4();

    /**
     * Cache the sent message for each user in the chat.
     * This is also the point, where we persist the message in the db
     */
    user.chats[user.currentChatId ?? ""].userIds.forEach((userId) => {
      const user = getActiveUser({
        email: userId,
        loginId: userId,
      });

      if (user) {
        user.chats[user.currentChatId ?? ""].messages.push({
          id,
          message,
          time,
          senderId,
          type: "message",
        });
      }
    });

    io.to(user.currentChatId).emit("receive_message", {
      senderId,
      message,
      time,
      id,
    });
  });
  // socket.on('adding', (data) => {
  // 	if (data.userID.ID === '') return;
  // 	userModule.allUsers(data.userID.ID);
  // });

  // socket.on('createRoom', () => {
  // 	userModule.matchUsers(socket);
  // });
});

app.use(cors());

server.listen(HTTP_PORT, () => {
  console.log(`on port ${HTTP_PORT}`);
});
