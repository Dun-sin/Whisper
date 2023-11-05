import { Socket } from 'socket.io';
import mongoose from 'mongoose';
import CryptoJS from 'crypto-js';

import ActiveUser from '../models/ActiveUserModel';
import Chat from '../models/ChatModel';
import Message from '../models/MessageModel';
import {
  ChatIdType,
  activeUserIdType,
  ActiveUserType,
  ChatType,
  MessageIdType,
  MessageType,
} from '@/types/types';

const secretKey = process.env.SECRET_KEY;

const waitingUsers: activeUserIdType = {};

const activeUsers: activeUserIdType = {};

const chats: ChatIdType = {};

function addActiveUser(user: ActiveUserType) {
  activeUsers[user.loginId] = user;
}

function getChat(chatId: string): ChatType {
  return chats[chatId] ?? null;
}

function getActiveUser(
  search: { socketId: string; loginId?: string; email?: null | string } | string
) {
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

function getChatsCount(id: string) {
  return getActiveUser(id)?.chatIds.length;
}

async function delActiveUser(user: ActiveUserType) {
  delete activeUsers[user.loginId];
  await ActiveUser.deleteOne({
    _id: user.id,
  });
}

// This funtion is used for removing user from waiting list
function delWaitingUser(id: string) {
  delete waitingUsers[id];
}

async function init() {
  const _chats = Chat.find()
    .populate('users')
    .populate({ path: 'messages', populate: { path: 'sender' } });
  for await (const chat of _chats) {
    const userIds = chat.users.map(user => user.loginId) as [string, string];
    const messages: MessageIdType = {};

    for (const message of chat.messages) {
      if (message.sender === null) {
        return;
      }

      messages[message._id.toString()] = {
        ...message.optimizedVersion,
        senderId: message.sender.loginId,
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

    activeUsers[activeUser.loginId] = {
      ...activeUser.optimizedVersion,
      chatIds: chats.map(chat => chat._id.toString()),
    };
  }
}

async function createChat(users: ActiveUserType[]) {
  const _chat: {
    _id: mongoose.Types.ObjectId;
    users: string[];
    messages: any[];
  } = {
    _id: new mongoose.Types.ObjectId(),
    users: [],
    messages: [],
  };

  const chatId = _chat._id.toString();

  // TODO: this shouldn't happen as now new users are added to active users collection instead of users collection.
  // find a way to take users from users and fill it in active users.
  for (let i = 0; i < users.length; i++) {
    const { email, loginId } = users[i];
    const user = await ActiveUser.create({
      email,
      loginId,
      currentChat: _chat._id,
    });

    _chat.users.push(user.id);

    users[i].id = user._id.toString();
    users[i].currentChatId = chatId;
    users[i].chatIds.push(chatId);
    users[i].socketConnections.map(socket => {
      socket.join(chatId);
    });

    addActiveUser(users[i]);
  }

  const chat = await Chat.create(_chat);

  const optimizedChat: ChatType = {
    ...chat.optimizedVersion,
    userIds: users.map(user => user.loginId) as [string, string],
  };

  chats[chatId] = optimizedChat;

  return optimizedChat;
}

async function closeChat(chatId: string) {
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

  const inactiveList: string[] = [];

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

      if (!inactiveList.includes(user.loginId)) {
        inactiveList.push(user.loginId);
      }
    }
  }

  delete chats[chatId];

  return inactiveList;
}

function chatExists(chatId: string) {
  return Boolean(getChat(chatId));
}

async function addMessage(
  chatId: string,
  {
    message,
    time,
    senderId,
    type = 'message',
    containsBadword,
    replyTo,
  }: MessageType
) {
  const sender = getActiveUser(senderId);

  message = CryptoJS.AES.encrypt(message, secretKey as string).toString();

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
        replyTo,
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

async function removeMessage(chatId: string, messageId: string) {
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

async function editMessage(
  chatId: string,
  {
    id,
    message,
    oldMessage,
  }: { id: string; message: string; oldMessage: string }
) {
  if (!chats[chatId]) {
    return false;
  }

  if (!chats[chatId].messages[id]) {
    return false;
  }

  message = CryptoJS.AES.encrypt(message, secretKey as string).toString();

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
    chats[chatId].messages[id]?.oldMessages?.push(oldMessage);
    return chats[chatId].messages[id];
  } catch {
    return false;
  }
}

async function seenMessage(chatId: string, messageId: string) {
  if (!chats[chatId]) {
    return false;
  }

  const isRead = true;

  try {
    const checkIfRead = await Message.findById(messageId);
    if (checkIfRead?.isRead) {
      return;
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
  /**
   * Since we indexed waiting users by emailOrLoginId, we need to first
   * retrieve all the keys which would be used for getting random users
   */
  const waitingUserIds = Object.keys(waitingUsers);
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

function isUserActive(id: string) {
  return Boolean(activeUsers[id]);
}

function addToWaitingList({
  loginId,
  email,
  socket,
}: {
  loginId: string;
  email?: string;
  socket: Socket;
}) {
  waitingUsers[loginId] = new Proxy(
    {
      loginId,
      email,
      socketConnections: [socket],
      socketIds: [socket.id],
      chatIds: [],
      currentChatId: null,
    },
    {
      get(target, prop, receiver) {
        if (prop === 'loginId') {
          return target.loginId;
        }

        return Reflect.get(target, prop, receiver);
      },
    }
  );
}

function getWaitingUserLen() {
  return Object.keys(waitingUsers).length;
}

export {
  init,
  createChat,
  closeChat,
  chatExists,
  getChat,
  addMessage,
  removeMessage,
  editMessage,
  getWaitingUserLen,
  delWaitingUser,
  getRandomPairFromWaitingList,
  isUserActive,
  getActiveUser,
  addToWaitingList,
  seenMessage,
};
