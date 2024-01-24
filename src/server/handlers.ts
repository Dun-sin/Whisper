import { Server, Socket } from 'socket.io';

import constants from '@/shared/constants/constants';
import { RoomType, OnlineStatus } from '@/types/types';
import {
  chatExists,
  closeChat,
  removeMessage,
  editMessage,
  isUserActive,
  addToWaitingList,
  getChat,
  getWaitingUserLen,
  getRandomPairFromWaitingList,
  createChat,
  getActiveUser,
  delWaitingUser,
  seenMessage,
  addMessage,
} from '@/server/lib/lib';

export const CloseChatHandler = (socket: Socket) => {
  socket.on(
    constants.NEW_EVENT_CLOSE,
    async (
      roomId: string | string[],
      setChatClosed: (arg0: boolean) => void
    ) => {
      const user = getActiveUser({
        socketId: socket.id,
      });

      if (!user || !chatExists(roomId as string)) {
        setChatClosed(false);
        return;
      }

      const inactiveList = await closeChat(roomId as string);

      setChatClosed(true);
      socket.broadcast.to(roomId).emit(constants.NEW_EVENT_CLOSE, roomId);
      inactiveList?.forEach((loginId: string) => {
        socket.broadcast.to(loginId).emit(constants.NEW_EVENT_INACTIVE);
      });
    }
  );
};

export const DeleteManagerHandler = (socket: Socket) => {
  socket.on(
    constants.NEW_EVENT_DELETE_MESSAGE,
    async ({ id: messageId, roomId }, messageWasDeletedSuccessfully) => {
      const user = getActiveUser({
        socketId: socket.id,
      });

      if (!user || !messageId || !roomId) {
        messageWasDeletedSuccessfully(false);
        return;
      }

      const messageDeleted = await removeMessage(roomId, messageId);

      socket.broadcast
        .to(roomId)
        .emit(constants.NEW_EVENT_DELETE_MESSAGE, { id: messageId, roomId });
      messageWasDeletedSuccessfully(messageDeleted);
    }
  );
};

export const EditMessageHandler = (socket: Socket) => {
  socket.on(
    constants.NEW_EVENT_EDIT_MESSAGE,
    async (
      { id: messageId, roomId, newMessage, oldMessage },
      messageWasEditedSuccessfully
    ) => {
      const user = getActiveUser({
        socketId: socket.id,
      });

      if (!user || !messageId || !roomId) {
        messageWasEditedSuccessfully(false);
        return;
      }

      const messageEdited = await editMessage(roomId, {
        id: messageId,
        message: newMessage,
        oldMessage,
      });
      socket.broadcast
        .to(roomId)
        .emit(constants.NEW_EVENT_EDIT_MESSAGE, messageEdited);
      messageWasEditedSuccessfully(messageEdited);
    }
  );
};

/**
 * this function will be triggred when ever the user from front-end will search
 * for new user to chat.
 */
const matchMaker = async (io: Server) => {
  while (getWaitingUserLen() > 1) {
    const chat = await createChat(getRandomPairFromWaitingList());
    const roomId: string = chat.id as unknown as string;
    io.to(roomId).emit(constants.NEW_EVENT_JOINED, {
      roomId: chat.id,
      userIds: chat.userIds,
    });
  }
};
export const JoinHandler = (io: Server, socket: Socket) => {
  socket.on(constants.NEW_EVENT_JOIN, ({ loginId, email }) => {
    /**
     * This is necessary to enable us send notifications to users
     * using multiple devices to chat
     */
    socket.join(loginId);

    /**
     * First we check if the user is already chatting.
     * If the user is already chatting, continue the chat from where the user left
     */
    if (isUserActive(loginId)) {
      const user = getActiveUser({
        socketId: socket.id,
        loginId,
        email: email ?? null,
      });

      // First join the user to the last chat
      if (!user?.socketIds.includes(socket.id)) {
        socket.join(user?.currentRoomId as string);
        user?.socketConnections.push(socket);
        user?.socketIds.push(socket.id);
      }

      const chats: RoomType = {};

      user?.rooms.forEach(roomId => {
        chats[roomId] = getChat(roomId);
      });

      // Then return all chat messages
      socket.emit(constants.NEW_EVENT_CHAT_RESTORE, {
        chats,
        currentRoomId: user?.currentRoomId,
      });
      return;
    }
    // The user was not having any previous chat. So add to the waiting list
    addToWaitingList({ loginId, email, socket });

    // Finally, run matchMaker to pair all users on the waiting list
    matchMaker(io);
  });
};

export const LogOutHandler = (io: Server, socket: Socket) => {
  socket.on(constants.NEW_EVENT_LOGOUT, async ({ loginId, email }) => {
    const user = getActiveUser({
      socketId: socket.id,
    });

    delWaitingUser(email ?? loginId);

    if (!user) {
      return;
    }

    // User is an anonymous user, so close all active chats
    if (!user.email) {
      for (const roomId of user.rooms) {
        const inactiveList = await closeChat(roomId);
        io.to(roomId).emit(constants.NEW_EVENT_CLOSE, roomId);
        inactiveList?.forEach(emailOrLoginId => {
          socket.broadcast
            .to(emailOrLoginId)
            .emit(constants.NEW_EVENT_INACTIVE);
        });
      }
    }
  });
};

export const OnlineStatusHandler = (socket: Socket) => {
  socket.on(
    constants.NEW_EVENT_ONLINE_STATUS,
    ({
      onlineStatus,
      roomId,
    }: {
      onlineStatus: OnlineStatus;
      roomId: string;
    }): void => {
      socket.broadcast
        .to(roomId)
        .emit(constants.NEW_EVENT_ONLINE_STATUS, onlineStatus);
    }
  );
};

export const SeenMessageHandler = (socket: Socket) => {
  socket.on(
    constants.NEW_EVENT_READ_MESSAGE,
    async ({ messageId, roomId }, messageSuccessfullySeen) => {
      const user = getActiveUser({ socketId: socket.id });

      if (!user || !messageId || !roomId) {
        messageSuccessfullySeen(false);
        return;
      }

      const messageSeen = await seenMessage(roomId, messageId);

      socket.broadcast.to(roomId).emit(constants.NEW_EVENT_READ_MESSAGE, {
        messageId,
        roomId,
      });

      messageSuccessfullySeen(messageSeen);
    }
  );
};

const messageCounts: {
  [id: string]: number;
} = {};

export const SendMessageHandler = (io: Server, socket: Socket) => {
  socket.on(
    constants.NEW_EVENT_SEND_MESSAGE,
    async (
      { senderId, message, time, roomId: roomId, containsBadword, replyTo },
      returnMessageToSender
    ) => {
      // Below line is just a failed message simulator for testing purposes.

      // export const rndInt = Math.floor(Math.random() * 6) + 1;
      // if (rndInt % 2 !== 0) {
      //   return;
      // }
      const user = getActiveUser({
        socketId: socket.id,
      });

      if (!user) {
        socket.emit(constants.NEW_EVENT_SEND_FAILED, {
          message:
            'Hmmm. It seems your login session has expired. ' +
            'Re-login and try again',
        });
        return;
      }

      // Check the message count for the user
      const userMessageCount = messageCounts[senderId] || 0;

      if (userMessageCount >= 25) {
        // User has exceeded the message limit
        socket.emit(constants.NEW_EVENT_SEND_FAILED, {
          message:
            'You have exceeded the message limit. Please try again later.',
        });
        return;
      }

      /**
       * Cache the sent message in memory a nd persist to db
       */
      const sentMessage = await addMessage(roomId, {
        message,
        time,
        senderId,
        type: 'message',
        containsBadword,
        replyTo,
      });

      const messageDetails = {
        ...sentMessage,
        roomId,
        status: 'sent',
      };

      returnMessageToSender(messageDetails);

      socket.broadcast
        .to(roomId)
        .emit(constants.NEW_EVENT_RECEIVE_MESSAGE, messageDetails);

      // Update the message count for the user
      messageCounts[senderId] = userMessageCount + 1;

      // Reset the count after 1 minute
      setTimeout(() => {
        messageCounts[senderId] = 0;
      }, 60 * 1000);
    }
  );
};

export const StopSearchHandler = (socket: Socket) => {
  try {
    socket.on(constants.NEW_EVENT_STOP_SEARCH, async ({ loginId }) => {
      delWaitingUser(loginId);
      socket.emit(constants.NEW_EVENT_STOP_SEARCH_SUCCESS);
    });
  } catch (err) {
    console.error(err);
  }
};

export const TypingHandler = (socket: Socket) => {
  socket.on(constants.NEW_EVENT_TYPING, ({ roomId, isTyping }) => {
    socket
      .to(roomId)
      .timeout(5000)
      .emit(constants.NEW_EVENT_DISPLAY, { isTyping, roomId });
  });
};
