import { io } from 'socket.io-client';
import { createContext } from 'react';

export const socket = io(import.meta.env.VITE_SOCKET_URL);
export const SocketContext = createContext(socket);
