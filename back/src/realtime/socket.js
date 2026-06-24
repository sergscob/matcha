import { Server } from "socket.io";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const { token } = parse(socket.handshake.headers.cookie || "");
      socket.userId = jwt.verify(token, process.env.JWT_SECRET).userId;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", socket => {
    socket.join(`user:${socket.userId}`);
  });

  return io;
}

export function emitToUser(userId, event, payload) {
  io?.to(`user:${userId}`).emit(event, payload);
}
