require('dotenv').config();

const validator = require('validator').default;
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
mongoose
  .connect(process.env.MongoDB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((e) => console.log(e));

// User Schema
const User = require('./models/UserSchema');

// Modules
const {
  getWaitingUserLen,
  getRandomPairFromWaitingList,
  isUserActive,
  getActiveUser,
  addToWaitingList,
  createChat,
  init,
  closeChat,
  getChat,
  removeMessage,
  addMessage,
  chatExists,
  editMessage,
  delWaitingUser,
} = require('./lib');

app.use(express.json());
app.use(cors());

app.post('/login', async (req, res) => {
  const { email } = req.body;

  if (typeof email !== 'string' || !validator.isEmail(email)) {
    res.status(406).json({
      message: 'Email is invalid',
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
    res.status(500).json({
      message: 'An error occured whiles logging in',
    });
  }
});

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
    }
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

/**
 * this function will be triggred when ever the user from front-end will search
 * for new user to chat.
 *
 * @param {Server} io
 */
const matchMaker = async (io) => {
  while (getWaitingUserLen() > 1) {
    const chat = await createChat(getRandomPairFromWaitingList());

    io.to(chat.id).emit('joined', {
      roomId: chat.id,
      userIds: chat.userIds,
    });
  }
};

// Sockets
io.on('connection', (socket) => {
  /**
   * This event is emitted once the user clicks on the Start button or
   * navigates to the /founduser route
   */
  socket.on('join', ({ loginId, email }) => {
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
      if (!user.socketIds.includes(socket.id)) {
        socket.join(user.currentChatId);
        user.socketConnections.push(socket);
        user.socketIds.push(socket.id);
      }

      const chats = {};

      user.chatIds.forEach((chatId) => {
        chats[chatId] = getChat(chatId);
      });

      // Then return all chat messages
      socket.emit('chat_restore', {
        chats,
        currentChatId: user.currentChatId,
      });
      return;
    }

    // User was not having any previous chat. So add to waiting list
    addToWaitingList({ loginId, email, socket });

    // Finally, run matchMaker to pair all users on the waiting list
    void matchMaker(io);
  });

  socket.on(
    'send_message',
    async (
      { senderId, message, time, chatId },
      returnMessageToSender
    ) => {
      // Below line is just a failed message simulator for testing purposes.

      // const rndInt = Math.floor(Math.random() * 6) + 1;
      // if (rndInt % 2 !== 0) {
      //   return;
      // }

      const user = getActiveUser({
        socketId: socket.id,
      });

      if (!user) {
        socket.emit('send_failed', {
          message:
            'Hmmm. It seems your login session has expired. ' +
            'Re-login and try again',
        });

        return;
      }

      /**
       * Cache the sent message in memory a nd persist to db
       */
      const sentMessage = await addMessage(chatId, {
        message,
        time,
        senderId,
        type: 'message',
      });

      const messageDetails = {
        ...sentMessage,
        room: chatId,
        status: 'sent',
      };

      returnMessageToSender(messageDetails);

      socket.broadcast
        .to(chatId)
        .emit('receive_message', messageDetails);
    }
  );

  socket.on(
    'edit_message',
    async (
      { id: messageId, chatId, newMessage },
      messageWasEditedSuccessfully
    ) => {
      const user = getActiveUser({
        socketId: socket.id,
      });

      if (!user || !messageId || !chatId) {
        messageWasEditedSuccessfully(false);
        return;
      }

      const messageEditted = await editMessage(chatId, {
        id: messageId,
        message: newMessage,
      });

      socket.broadcast
        .to(chatId)
        .emit('edit_message', { id: messageId, chatId, newMessage });
      messageWasEditedSuccessfully(messageEditted);
    }
  );

  socket.on(
    'delete_message',
    async (
      { id: messageId, chatId },
      messageWasDeletedSuccessfully
    ) => {
      const user = getActiveUser({
        socketId: socket.id,
      });

      if (!user || !messageId || !chatId) {
        messageWasDeletedSuccessfully(false);
        return;
      }

      const messageDeleted = await removeMessage(chatId, messageId);

      socket.broadcast
        .to(chatId)
        .emit('delete_message', { id: messageId, chatId });
      messageWasDeletedSuccessfully(messageDeleted);
    }
  );

  socket.on('typing', ({ chatId, isTyping }) => {
    socket
      .to(chatId)
      .timeout(5000)
      .emit('display', { isTyping, chatId });
  });

  socket.on('logout', async ({ loginId, email }) => {
    const user = getActiveUser({
      socketId: socket.id,
    });

    delWaitingUser(email ?? loginId);

    console.log(email, loginId);

    if (!user) {
      return;
    }

    // User is an anonymous user, so close all active chats
    if (!user.email) {
      for (const chatId of user.chatIds) {
        const inactiveList = await closeChat(chatId);
        io.to(chatId).emit('close', chatId);
        inactiveList.forEach((emailOrLoginId) => {
          socket.broadcast.to(emailOrLoginId).emit('inactive');
        });
      }
    }
  });

  socket.on('close', async (chatId, setChatClosed) => {
    const user = getActiveUser({
      socketId: socket.id,
    });

    if (!user || !chatExists(chatId)) {
      setChatClosed(false);
      return;
    }

    const inactiveList = await closeChat(chatId);

    setChatClosed(true);
    socket.broadcast.to(chatId).emit('close', chatId);
    inactiveList.forEach((emailOrLoginId) => {
      socket.broadcast.to(emailOrLoginId).emit('inactive');
    });
  });

  socket.on('stop_search', async ({ loginId, email }) => {
    await delWaitingUser(email ?? loginId);
    socket.emit('stop_search_success');
  });
});

app.use(cors());

server.listen(HTTP_PORT, async () => {
  await init();
  console.log(`on port ${HTTP_PORT}`);
});
