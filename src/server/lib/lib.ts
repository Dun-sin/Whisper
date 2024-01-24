import { Socket } from 'socket.io';
import mongoose from 'mongoose';
import CryptoJS from 'crypto-js';

import ActiveUser from '@/server/models/ActiveUserModel';
import Chat from '@/server/models/ChatModel';
import Message from '@/server/models/MessageModel';
import {
  RoomType,
  activeUserIdType,
  ActiveUserType,
  ChatType,
  MessageIdType,
  MessageType,
} from '@/types/types';

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;

const waitingUsers: activeUserIdType = {};

const activeUsers: activeUserIdType = {};

const chats: RoomType = {};

function addActiveUser(user: ActiveUserType) {
  activeUsers[user.loginId] = user;
}

function getChat(room: string): ChatType {
  return chats[room] ?? null;
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
  return getActiveUser(id)?.rooms.length;
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

  type objType = {
    id: string;
    email: string | null;
    loginId: string;
    socketConnections: Socket[];
    socketIds: string[];
    currentChat?: string | null;
    currentroom: string | null;
    rooms: string[];
  };

  for await (const activeUser of ActiveUser.find()) {
    const chats = await Chat.find({
      users: {
        $in: [activeUser._id],
      },
    });

    const obj: objType = {
      ...activeUser.optimizedVersion,
      currentroom: activeUser.optimizedVersion.currentChat,
      rooms: chats.map(chat => chat._id.toString()) as string[],
    };

    delete obj.currentChat;

    activeUsers[activeUser.loginId] = obj;
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

  const room = _chat._id.toString();

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
    users[i].currentroom = room;
    users[i].rooms.push(room);
    users[i].socketConnections.map(socket => {
      socket.join(room);
    });

    addActiveUser(users[i]);
  }

  const chat = await Chat.create(_chat);

  const optimizedChat: ChatType = {
    ...chat.optimizedVersion,
    userIds: users.map(user => user.loginId) as [string, string],
  };

  chats[room] = optimizedChat;

  return { id: room, ...optimizedChat };
}

async function closeChat(room: string) {
  await Chat.deleteOne({
    _id: room,
  });

  const chat = getChat(room);

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

    user.rooms.forEach((id, i) => {
      if (id === room) {
        user.rooms.splice(i, 1);
      }
    });

    await Chat.deleteOne({
      _id: room,
    });

    if (getChatsCount(userId) === 0) {
      user.currentroom = null;
      await delActiveUser(user);

      if (!inactiveList.includes(user.loginId)) {
        inactiveList.push(user.loginId);
      }
    }
  }

  delete chats[room];

  return inactiveList;
}

function chatExists(room: string) {
  return Boolean(getChat(room));
}

async function addMessage(
  room: string,
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

  if (!chats[room]) {
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
      _id: room,
    },
    {
      $push: {
        messages: optimizedMessage.id,
      },
    }
  );

  chats[room].messages[optimizedMessage.id] = optimizedMessage;

  return optimizedMessage;
}

async function removeMessage(room: string, messageId: string) {
  if (!chats[room]) {
    return false;
  }

  try {
    await Message.deleteOne({
      _id: messageId,
    });
  } catch {
    return false;
  }

  delete chats[room].messages[messageId];

  return true;
}

async function editMessage(
  room: string,
  {
    id,
    message,
    oldMessage,
  }: { id: string; message: string; oldMessage: string }
) {
  if (!chats[room]) {
    return false;
  }

  if (!chats[room].messages[id]) {
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

    chats[room].messages[id].message = message;
    chats[room].messages[id].isEdited = true;
    if (!Array.isArray(chats[room].messages[id].oldMessages)) {
      chats[room].messages[id].oldMessages = [];
    }
    chats[room].messages[id]?.oldMessages?.push(oldMessage);
    return chats[room].messages[id];
  } catch {
    return false;
  }
}

async function seenMessage(room: string, messageId: string) {
  if (!chats[room]) {
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

    chats[room].messages[messageId].isRead = isRead;
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
      rooms: [],
      currentroom: null,
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
