import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
	autoConnect: false,
});

export function connectWithId(chatId) {
	return new Promise((resolve, reject) => {
		try {
			if (chatId) {
				socket.io.opts.query = { chatId };
			}

			socket.connect();

			socket.on('connect', () => {
				resolve(true);
			});

			socket.on('connect_error', (error) => {
				reject(error);
			});
		} catch (error) {
			reject(error);
		}
	});
}
