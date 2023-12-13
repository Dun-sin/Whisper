import {
  createContext,
  useEffect,
  useContext,
  ReactNode,
  useState,
} from 'react';
import io, { Socket } from 'socket.io-client';
import { useApp } from './AppContext';

interface SocketContextProps {
  socket?: Socket;
}

const SocketContext = createContext<SocketContextProps>({});

interface SocketProviderProps {
  children: ReactNode;
}

const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const { updateConnection } = useApp();

  const socketInitializer = async () => {
    await fetch('/api/server');
    const socket = io();

    socket.on('connect', () => {
      console.log('connected');
      updateConnection(false);
    });

    setSocket(socket);
  };

  useEffect(() => {
    socketInitializer();
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

const useSocket = (): SocketContextProps => {
  return useContext(SocketContext);
};

export { SocketProvider, useSocket };
