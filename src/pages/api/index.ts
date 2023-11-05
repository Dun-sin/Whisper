import { NextApiRequest, NextApiResponse } from 'next';

import type { Server as IOServer } from 'socket.io';
import { Server, Socket } from 'socket.io';

import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import cors from 'cors';
import { createRouter } from 'next-connect';

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
import connectMongo from '@/mongo';

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

const handler = createRouter<NextApiRequest, NextApiResponseWithSocket>();

// Enable CORS
handler.use(cors());

handler.all(async (_: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res.socket.server.io) {
    console.log('Already set up');
    res.end();
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
});

export default handler;
