// pages/api/server.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Server, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import cors from 'cors';
import JoinHandler from '@/sockets/join';
import SendMessageHandler from '@/sockets/sendMessage';
import EditMessageHandler from '@/sockets/editMessage';
import DeleteManagerHandler from '@/sockets/deleteMessage';
import SeenMessageHandler from '@/sockets/seenMesage';
import TypingHandler from '@/sockets/typing';
import LogOutHandler from '@/sockets/logout';
import CloseChatHandler from '@/sockets/close';
import StopSearchHandler from '@/sockets/stopSearch';
import OnlineStatusHandler from '@/sockets/onlineStatus';
import connectMongo from '@/service/mongo';

interface SocketServer extends HTTPServer {
  io?: Server | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

export interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

export default async (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  try {
    if (res.socket.server.io) {
      console.log('Already set up');
      res.end();
      await connectMongo();
      return;
    }

    const io = new Server(res.socket.server, {
      cors: { origin: '*' },
    });

    await connectMongo();

    // Event handler for client connections
    io.on('connection', (socket: Socket) => {
      const clientId = socket.id;
      console.log('A client connected');
      console.log(`A client connected. ID: ${clientId}`);

      JoinHandler(io, socket);
      SendMessageHandler(socket);
      EditMessageHandler(socket);
      DeleteManagerHandler(socket);
      SeenMessageHandler(socket);
      TypingHandler(socket);
      LogOutHandler(io, socket);
      CloseChatHandler(socket);
      StopSearchHandler(socket);
      OnlineStatusHandler(socket);

      // Event handler for client disconnections
      socket.on('disconnect', () => {
        console.log('A client disconnected.');
      });
    });

    res.socket.server.io = io;
    res.end();
  } catch (error) {
    console.error(error);
  }
};
