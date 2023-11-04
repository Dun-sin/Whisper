// client/socket.ts

import { ProviderType } from '@/types';
import { createContext, useContext, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

// Create a context to manage the socket
export const SocketContext = createContext<Socket | null>(null);

// Custom hook to get the socket from the context
export const useSocket = () => {
	const socket = useContext(SocketContext);
	if (!socket) {
		throw new Error('useSocket must be used within a SocketProvider');
	}
	return socket;
};

// Initialize the socket
export const initSocket = (): Socket => {
	const socket = io('/api/server', {
		autoConnect: false,
	});
	return socket;
};

// Provide the socket through the context
export const SocketProvider = ({ children }: ProviderType) => {
	const socket = initSocket();

	useEffect(() => {
		socket.connect(); // Connect when the component mounts

		return () => {
			socket.disconnect(); // Disconnect when the component unmounts
		};
	}, [socket]);

	return (
		<SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
	);
};
