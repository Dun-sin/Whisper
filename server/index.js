require("dotenv").config();

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const HTTP_PORT = process.env.PORT || 4000;

const cors = require("cors");
const mongoose = require("mongoose");

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*" },
  reconnectionAttempts: 5,
});
const { init } = require("./utils/lib");

mongoose
  .connect(process.env.MongoDB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`connected to mongodb`);
  })
  .catch((e) => e);
mongoose.set("strictQuery", false);

const UserRouter = require("./controllers/userController");

// Socket Event Handlers
const JoinHandler = require("./sockets/join");
const SendMessageHandler = require("./sockets/sendMessage");
const EditMessageHandler = require("./sockets/editMessage");
const DeleteMessageHandler = require("./sockets/deleteMessage");
const TypingHandler = require("./sockets/typing");
const LogOutHandler = require("./sockets/logout");
const CloseChatHandler = require("./sockets/close");

app.use(express.json());
app.use(cors());
app.use(UserRouter);

// triggers when a user is connected to a socket
io.on("connection", (socket) => {
  /**
   * This event is emitted once the user clicks on the Start button or
   * navigates to the /founduser route
   */
  JoinHandler(io, socket);
  SendMessageHandler(socket);
  EditMessageHandler(socket);
  DeleteMessageHandler(socket);
  TypingHandler(socket);
  LogOutHandler(io, socket);
  CloseChatHandler(socket);
});

app.use(cors());

server.listen(HTTP_PORT, async () => {
  await init();
  console.log(`connected to port ${HTTP_PORT}`);
});
