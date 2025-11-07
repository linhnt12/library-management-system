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
    console.log('socket.handshake.auth', socket.handshake.auth);
    console.log('socket.handshake.headers', socket.handshake.headers);

    // Get token from multiple sources (in order of preference):
    // 1. auth object (primary method for Socket.IO)
    // 2. Authorization header
    // 3. query parameter (fallback for visibility/debugging)
    const raw =
      (socket.handshake.auth?.token as string | undefined) ||
      socket.handshake.headers?.authorization ||
      (socket.handshake.query?.token as string | undefined);

    if (!raw) {
      console.error('No token found in handshake');
      console.error('Available auth:', socket.handshake.auth);
      console.error('Available headers:', socket.handshake.headers);
      console.error('Available query:', socket.handshake.query);
      return next(new Error('unauthorized'));
    }

    // Extract token (remove "Bearer " prefix if present)
    const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
    if (!token || token.trim() === '') {
      console.error('Token is empty after extraction');
      return next(new Error('unauthorized'));
    }

    // Verify and decode token (ignore expiration for WebSocket connections)
    // Still verifies signature, issuer, and audience for security
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const payload = jwt.verify(token, jwtSecret, {
      issuer: 'library-management-system',
      audience: 'library-users',
      ignoreExpiration: true, // Don't check expiration time for WebSocket connections
    }) as {
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

    console.log('Socket authenticated successfully:', socket.data.user);

    return next();
  } catch (err) {
    // Log the actual error for debugging
    // Note: TokenExpiredError won't occur since we ignore expiration
    if (err instanceof jwt.JsonWebTokenError) {
      console.error('JWT verification error:', err.message);
    } else if (err instanceof jwt.NotBeforeError) {
      console.error('JWT not active yet:', err.date);
    } else {
      console.error('Authentication error:', err);
    }
    return next(new Error('unauthorized'));
  }
});

io.on('connection', socket => {
  console.log('Connected:', socket.id);
  socket.on('ping', () => socket.emit('pong'));
});

server.listen(4000, () => console.log('Socket server running on :4000'));
