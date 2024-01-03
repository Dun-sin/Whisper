import { Socket, Server } from 'socket.io';

const executeHandlers = (io: Server, socket: Socket, handlers: any) => {
  handlers.forEach((handler: any) => handler(io, socket));
};

export default executeHandlers;
