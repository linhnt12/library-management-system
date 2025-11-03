// server/socket-server.ts
import { Role } from '@prisma/client';
import http from 'http';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';

const server = http.createServer();
const io = new Server(server, { cors: { origin: '*' } });

// Middleware: require token
io.use((socket: Socket, next) => {
  try {
    // client: io(url, { auth: { token: "Bearer <JWT>" } })
    const raw =
      (socket.handshake.auth?.token as string | undefined) ||
      socket.handshake.headers?.authorization;
    if (!raw) return next(new Error('unauthorized'));

    // Extract token (remove "Bearer " prefix if present)
    const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
    if (!token) return next(new Error('unauthorized'));

    // Verify and decode token use import jwt from 'jsonwebtoken';
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as {
      userId: number;
      email: string;
      role: Role;
      iat?: number;
      exp?: number;
    };

    // Attach user info to socket for later use
    socket.data.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    return next();
  } catch (err) {
    return next(new Error('unauthorized'));
  }
});

io.on('connection', socket => {
  console.log('Connected:', socket.id);
  socket.on('ping', () => socket.emit('pong'));
});

server.listen(4000, () => console.log('Socket server running on :4000'));
