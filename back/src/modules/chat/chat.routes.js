import { Router } from "express";

import { sendMessageSchema, paginationSchema } from "./chat.validation.js";
import {
  getConversations,
  getMessages,
  markRead,
  sendMessage
} from "./chat.service.js";

import { authMiddleware } from "../../middleware/auth.middleware.js";

async function conversationsController(req, res) {
  res.json(await getConversations(req.userId));
}

async function messagesController(req, res) {
  const { limit = 50, offset = 0 } = paginationSchema.parse(req.query);

  res.json(await getMessages(req.userId, Number(req.params.id), limit, offset));
}

async function sendMessageController(req, res) {
  const { body } = sendMessageSchema.parse(req.body);

  res.status(201).json(await sendMessage(req.userId, Number(req.params.id), body));
}

async function markReadController(req, res) {
  await markRead(req.userId, Number(req.params.id));
  res.json({ message: "Marked as read" });
}

const router = Router();

router.use(authMiddleware);

router.get("/conversations", conversationsController);
router.get("/:id/messages", messagesController);
router.post("/:id/messages", sendMessageController);
router.post("/:id/read", markReadController);

export default router;
