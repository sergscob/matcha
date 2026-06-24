import { createServer } from "http";

import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./modules/auth/auth.routes.js";
import profileRoutes from "./modules/profile/profile.routes.js";
import discoverRoutes from "./modules/discover/discover.routes.js";
import notificationsRoutes from "./modules/notifications/notifications.routes.js";
import chatRoutes from "./modules/chat/chat.routes.js";
import { initSocket } from "./realtime/socket.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";

dotenv.config();

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/", (req, res) => {
  res.json({ message: "Matcha API" });
});

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/discover", discoverRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/chat", chatRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(
  process.env.PORT,
  () => {
    console.log(`Server running on ${process.env.PORT}`);
  }
);