const { Socket } = require('socket.io');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const ActiveUser = require('../models/UserModel');
const Chat = require('../models/ChatModel');
const User = require('../models/UserModel');
const Message = require('../models/MessageModel');
const { generateObjectId } = require('./helper');

const { FIFTEEN_MINUTES } = require('../../constants.json');


/**
 * @typedef {{
 *     id: string,
 *     email: null | string,
 *     loginId: string,
 *     emailOrLoginId: string,
 *     socketConnections: Socket[],
 *     socketIds: string[],
 *     currentChatId: null | string,
 *     chatIds: string[]
 * }} ActiveUser
 *
 * @typedef {{
 *     id: string,
 *     userIds: string[],
 *     messages: {
 *        [key: string]: Message
 *     },
 *     createdAt: string | Date
 * }} Chat
 *
 * @typedef {{
 *     id: string,
 *     message: string,
 *     senderId: string,
 *     time: string | Date,
 *     type: 'room_notification' | 'message'
 * }} Message
 */

/**
 * The list of all users on the waiting list, indexed by emailOrLoginId
 *
 * @type {{[key: string]: ActiveUser}}
 */
const waitingUsers = {};

/**
 * The list of all active users (including those on waiting list), indexed
 * by emailOrLoginId
 *
 * @type {{[key: string]: ActiveUser}}
 */
const activeUsers = {};

/**
 * The list of all active chats, indexed by chatId
 *
 * @type {{[key: string]: Chat}}
 */
const chats = {};

/**
 *
 * @param {ActiveUser} user
 */
function addActiveUser(user) {
  activeUsers[user.emailOrLoginId] = user;
}

/**
 *
 * @param {string} chatId
 *
 * @return {null | Chat}
 */
function getChat(chatId) {
  return chats[chatId] ?? null;
}

/**
 *
 * @param {{ socketId: string, loginId?: string, email?: null | string} | string} search
 */
function getActiveUser(search) {
  if (typeof search === 'string') {
    for (const id in activeUsers) {
      const user = activeUsers[id];

      if (
        user.socketIds.includes(search) ||
        user.email === search ||
        user.loginId === search
      ) {
        return user;
      }
    }
  } else {
    const { socketId, loginId, email } = search;
    for (const id in activeUsers) {
      const user = activeUsers[id];

      if (
        user.socketIds.includes(socketId) ||
        (email && user.email === email) ||
        (loginId && user.loginId === loginId)
      ) {
        return user;
      }
    }
  }

  return null;
}

/**
 *
 * @param {string} emailOrLoginId
 * @returns
 */
function getChatsCount(emailOrLoginId) {
  return getActiveUser(emailOrLoginId).chatIds.length;
}

/**
 *
 * @param {ActiveUser} user
 */
async function delActiveUser(user) {
  delete activeUsers[user.emailOrLoginId];

  const userToDelete = await ActiveUser.findById(user.id);
  if (
    userToDelete &&
    (!userToDelete.email || userToDelete.email.trim() === '')
  ) {
    await ActiveUser.deleteOne({ _id: user.id });
  }
}

// This funtion is used for removing user from waiting list
function delWaitingUser(id) {
  delete waitingUsers[id];
}

async function init() {
  const _chats = Chat.find()
    .populate('users')
    .populate({ path: 'messages', populate: { path: 'sender' } });
  for await (const chat of _chats) {
    const userIds = chat.users.map((user) => user.emailOrLoginId);
    const messages = {};

    for (const message of chat.messages) {
      if (message.sender === null) {
        return;
      }

      messages[message._id.toString()] = {
        ...message.optimizedVersion,
        senderId: message.sender.emailOrLoginId,
      };
    }

    chats[chat._id.toString()] = {
      ...chat.optimizedVersion,
      userIds,
      messages,
    };
  }

  for await (const activeUser of ActiveUser.find()) {
    const chats = await Chat.find({
      users: {
        $in: [activeUser._id],
      },
    });

    activeUsers[activeUser.emailOrLoginId] = {
      ...activeUser.optimizedVersion,
      chatIds: chats.map((chat) => chat._id.toString()),
    };
  }
}

/**
 *
 * @param {ActiveUser[]} users
 *
 * @return {Promise<Chat>}
 */
async function createChat(users) {
  const _chat = {
    _id: new mongoose.Types.ObjectId(),
    users: [],
    messages: [],
  };

  const chatId = _chat._id.toString();

  // this shouldn't happen as now new users are added to active
  // users collection instead of users collection.
  // find a way to take users from users and fill it in active users.
  try {
    for (let i = 0; i < users.length; i++) {
      const { email, loginId } = users[i];
      let user;
      const findUser = await ActiveUser.findOne({ loginId: loginId });
      if (findUser) {
        user = findUser;
      } else {
        user = await ActiveUser.create({
          email,
          loginId,
          currentChat: _chat._id,
          _id: new ObjectId(generateObjectId()),
        });
      }
      _chat.users.push(user._id);

      users[i].id = user._id.toString();
      users[i].currentChatId = chatId;
      users[i].chatIds.push(chatId);

      users[i].socketConnections.map((socket) => {
        socket.join(chatId);
      });

      addActiveUser(users[i]);
    }
  } catch (error) {
    console.log(`error creating user: ${error}`);
  }

  try {
    const chat = await Chat.create(_chat);
    /** @type {Chat} */
    const optimizedChat = {
      ...chat.optimizedVersion,
      userIds: users.map((user) => user.emailOrLoginId),
    };

    chats[chatId] = optimizedChat;

    return optimizedChat;
  } catch (error) {
    console.log(`error creating chat: ${error}`);
  }
}

/**
 *
 * @param {string} chatId
 */
async function closeChat(chatId) {
  await Chat.deleteOne({
    _id: chatId,
  });

  const chat = getChat(chatId);

  if (!chat) {
    return null;
  }

  await Message.deleteMany({
    _id: {
      $in: Object.keys(chat.messages),
    },
  });

  const inactiveList = [];

  for (const userId of chat.userIds) {
    const user = getActiveUser(userId);

    if (!user) {
      continue;
    }

    user.chatIds.forEach((id, i) => {
      if (id === chatId) {
        user.chatIds.splice(i, 1);
      }
    });

    await Chat.deleteOne({
      _id: chatId,
    });

    if (getChatsCount(userId) === 0) {
      user.currentChatId = null;
      await delActiveUser(user);

      if (!inactiveList.includes(user.emailOrLoginId)) {
        inactiveList.push(user.emailOrLoginId);
      }
    }
  }

  delete chats[chatId];

  return inactiveList;
}

/**
 *
 * @param {string} chatId
 */
function chatExists(chatId) {
  return Boolean(getChat(chatId));
}

/**
 *
 * @param {string} chatId
 * @param {Message} message
 */
async function addMessage(
  chatId,
  { message, time, senderId, type = 'message', containsBadword, replyTo }
) {
  const sender = getActiveUser(senderId);

  if (!sender) {
    return null;
  }

  if (!chats[chatId]) {
    return null;
  }

  const optimizedMessage = {
    ...(
      await Message.create({
        message: message,
        sender: new mongoose.Types.ObjectId(sender.id),
        type,
        createdAt: new Date(time),
        containsBadword,
        replyTo
      })
    ).optimizedVersion,
    senderId,
  };

  await Chat.updateOne(
    {
      _id: chatId,
    },
    {
      $push: {
        messages: optimizedMessage.id,
      },
    }
  );

  chats[chatId].messages[optimizedMessage.id] = optimizedMessage;

  return optimizedMessage;
}

async function removeMessage(chatId, messageId) {
  if (!chats[chatId]) {
    return false;
  }

  try {
    await Message.deleteOne({
      _id: messageId,
    });
  } catch {
    return false;
  }

  delete chats[chatId].messages[messageId];

  return true;
}

async function editMessage(chatId, { id, message, oldMessage }) {
  if (!chats[chatId]) {
    return false;
  }

  if (!chats[chatId].messages[id]) {
    return false;
  }

  try {
    await Message.findOneAndUpdate(
      { _id: id },
      {
        $set: { message, isEdited: true },
        $push: { oldMessages: oldMessage },
      },
      { new: true }
    );

    chats[chatId].messages[id].message = message;
    chats[chatId].messages[id].isEdited = true;
    if (!Array.isArray(chats[chatId].messages[id].oldMessages)) {
      chats[chatId].messages[id].oldMessages = [];
    }
    chats[chatId].messages[id].oldMessages.push(oldMessage);
    return chats[chatId].messages[id];
  } catch {
    return false;
  }
}

async function seenMessage(chatId, messageId) {
  if (!chats[chatId]) {
    return false;
  }

  const isRead = true;

  try {
    const checkIfRead = await Message.findById(messageId)
    if (checkIfRead.isRead) {
      return
    }
    await Message.findOneAndUpdate(
      {
        _id: messageId,
      },
      { $set: { isRead: isRead } },
      { new: true }
    );

    chats[chatId].messages[messageId].isRead = isRead;
  } catch {
    return false;
  }
  return true;
}

function getRandomPairFromWaitingList() {
  const waitingUserIds = Object.keys(waitingUsers);
  if (waitingUserIds.length < 2) return [];

  const pairedUsers = [];
  for (let i = 0; i < 2; i++) {
    const randomIndex = Math.floor(Math.random() * waitingUserIds.length);
    const randomId = waitingUserIds[randomIndex];
    pairedUsers.push(waitingUsers[randomId]);
    delWaitingUser(randomId);
    waitingUserIds.splice(randomIndex, 1);
  }

  return pairedUsers;
}


/**
 * @param {string} emailOrLoginId
 */
function isUserActive(emailOrLoginId) {
  return Boolean(activeUsers[emailOrLoginId]);
}

/**
 *
 * @param {{
 *     loginId: string,
 *     email?: null | string,
 *     socket: Socket
 * }} param0
 */
function addToWaitingList({ loginId, email, socket }) {
  const emailOrLoginId = email ?? loginId;

  if (waitingUsers[emailOrLoginId]) {
    console.log(`User already in waiting list: ${emailOrLoginId}. Adding new socket connection.`);
    waitingUsers[emailOrLoginId].socketConnections.push(socket);
    waitingUsers[emailOrLoginId].socketIds.push(socket.id);
    console.log(`Updated socketIds: ${waitingUsers[emailOrLoginId].socketIds}`);
  } else {
    console.log(`Adding new user to waiting list: ${emailOrLoginId}`);
    waitingUsers[emailOrLoginId] = new Proxy(
      {
        loginId,
        email,
        socketConnections: [socket],
        socketIds: [socket.id],
        chatIds: [],
        currentChatId: null,
      },
      {
        get(target, prop) {
          if (prop === 'emailOrLoginId') {
            return target.email ?? target.loginId;
          }
          return Reflect.get(target, prop);
        },
      }
    );
    console.log(`Waiting users now: ${Object.keys(waitingUsers)}`);
  }
}



function getWaitingUserLen() {
  return Object.keys(waitingUsers).length;
}

async function blockUser(userIdToBlock, currentUserId) {
  try {
    await User.findOneAndUpdate({ loginId: currentUserId }, {
      $addToSet: { blockedUsers: userIdToBlock }
    });
  } catch (error) {
    console.log(`error blocking user: ${error}`);
  }
}

async function isUserBlocked(users) {
  const [userOne, userTwo] = users;

  try {
    const [userOneData, userTwoData] = await Promise.all([
      User.findOne({ loginId: userOne.loginId }),
      User.findOne({ loginId: userTwo.loginId })
    ]);

    // Using 'OR' because one of the users might be anonymously logged in,
    // and in such cases, userData could be null.
    if (userOneData || userTwoData) {
      const userOneBlocked = userOneData?.blockedUsers.includes(userTwo.loginId);
      const userTwoBlocked = userTwoData?.blockedUsers.includes(userOne.loginId);
      return userOneBlocked || userTwoBlocked;
    }
    return false;
  } catch (error) {
    console.log(`error checking if users are blocked: ${error}`);
  }
}

  function isMessageEditableOrDeletable(chatId, messageId) {
    const chat = chats[chatId];
    if (!chat || !chat.messages || !chat.messages[messageId]) {
        return false; // Message doesn't exist
    }

    const message = chat.messages[messageId];
    const timeSinceCreated = Date.now() - new Date(message.time).getTime();
    return timeSinceCreated <= FIFTEEN_MINUTES; // Check if within 15 minutes
}

module.exports = {
  init,
  createChat,
  closeChat,
  chatExists,
  getChat,
  addMessage,
  removeMessage,
  editMessage,
  getChatsCount,
  addActiveUser,
  getWaitingUserLen,
  delWaitingUser,
  getRandomPairFromWaitingList,
  isUserActive,
  getActiveUser,
  addToWaitingList,
  delActiveUser,
  seenMessage,
  blockUser,
  isUserBlocked,
  isMessageEditableOrDeletable
};
