// pages/api/server.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Server, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';

import * as handlers from '@/handlers';
import executeHandlers from '@/handlerDecorator';

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
      await connectMongo();
      res.end();
      return;
    }

    const io = new Server(res.socket.server, {
      cors: { origin: '*' },
    });

    await connectMongo();

    // Event handler for client connections
    io.on('connect', (socket: Socket) => {
      const clientId = socket.id;
      console.log(`A client connected. ID: ${clientId}`);

      executeHandlers(io, socket, Object.values(handlers));

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
