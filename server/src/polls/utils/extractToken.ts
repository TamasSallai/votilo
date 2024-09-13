import { Socket } from 'socket.io';

const extractTokenFromSocket = (socket: Socket): string | undefined => {
  return socket.handshake.auth.token || socket.handshake.headers['token'];
};

export default extractTokenFromSocket;
