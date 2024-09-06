import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
	autoConnect: false,
});

export function connectWithId(chatId) {
	if (chatId) {
		socket.io.opts.query = { chatId };
	}
	socket.connect();
}
