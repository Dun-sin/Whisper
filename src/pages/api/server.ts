import { NextApiRequest, NextApiResponse } from 'next';

import type { Server as IOServer } from 'socket.io';

import { Server } from 'socket.io';

import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import cors from 'cors';
import { createRouter } from 'next-connect';

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

handler.all((_: NextApiRequest, res: NextApiResponseWithSocket) => {
	if (res.socket.server.io) {
		console.log('Already set up');
		res.end();
		return;
	}

	const io = new Server(res.socket.server);

	// Event handler for client connections
	io.on('connection', (socket) => {
		const clientId = socket.id;
		console.log('A client connected');
		console.log(`A client connected. ID: ${clientId}`);
		io.emit('client-new', clientId);

		// Event handler for client disconnections
		socket.on('disconnect', () => {
			console.log('A client disconnected.');
		});
	});

	res.socket.server.io = io;
	res.end();
});

export default handler;
