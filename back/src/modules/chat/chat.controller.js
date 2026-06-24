import { sendMessageSchema, paginationSchema } from "./chat.validation.js";
import {
  getConversations,
  getMessages,
  markRead,
  sendMessage
} from "./chat.service.js";

export async function conversationsController(req, res) {
  res.json(await getConversations(req.userId));
}

export async function messagesController(req, res) {
  const { limit = 50, offset = 0 } = paginationSchema.parse(req.query);

  res.json(await getMessages(req.userId, Number(req.params.id), limit, offset));
}

export async function sendMessageController(req, res) {
  const { body } = sendMessageSchema.parse(req.body);

  res.status(201).json(await sendMessage(req.userId, Number(req.params.id), body));
}

export async function markReadController(req, res) {
  await markRead(req.userId, Number(req.params.id));
  res.json({ message: "Marked as read" });
}
