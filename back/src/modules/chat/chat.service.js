import {
  hasMessageHistory,
  insertMessage,
  listMessages,
  markMessagesRead,
  listConversations
} from "./chat.repository.js";
import { hasLiked, isBlockedEitherWay } from "../discover/discover.repository.js";
import { createNotification } from "../notifications/notifications.service.js";
import { emitToUser } from "../../realtime/socket.js";
import { AppError } from "../../utils/AppError.js";

const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

function isOnline(lastSeen) {
  return Boolean(lastSeen) && Date.now() - new Date(lastSeen).getTime() < ONLINE_THRESHOLD_MS;
}

async function isConnected(userId1, userId2) {
  return (await hasLiked(userId1, userId2)) && (await hasLiked(userId2, userId1));
}

async function assertCanView(viewerId, otherId) {
  if (await isBlockedEitherWay(viewerId, otherId)) {
    throw new AppError("Conversation not found", 404);
  }

  if (!(await isConnected(viewerId, otherId)) && !(await hasMessageHistory(viewerId, otherId))) {
    throw new AppError("Conversation not found", 404);
  }
}

function toMessageDto(row) {
  return {
    id: row.id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    body: row.body,
    createdAt: row.created_at,
    isRead: Boolean(row.read_at)
  };
}

export async function getConversations(userId) {
  const rows = await listConversations(userId);

  return rows.map(row => ({
    id: row.id,
    username: row.username,
    firstName: row.first_name,
    lastName: row.last_name,
    photoUrl: row.profile_photo ? `/uploads/${row.profile_photo}` : null,
    isOnline: isOnline(row.last_seen),
    lastMessage: row.last_message_body
      ? { body: row.last_message_body, senderId: row.last_message_sender_id, createdAt: row.last_message_at }
      : null,
    unreadCount: Number(row.unread_count)
  }));
}

export async function getMessages(viewerId, otherId, limit, offset) {
  await assertCanView(viewerId, otherId);

  const rows = await listMessages(viewerId, otherId, limit, offset);
  return rows.map(toMessageDto);
}

export async function markRead(viewerId, otherId) {
  await markMessagesRead(viewerId, otherId);
}

export async function sendMessage(senderId, recipientId, body) {
  if (senderId === recipientId) {
    throw new AppError("You can't message yourself", 400);
  }

  if (await isBlockedEitherWay(senderId, recipientId)) {
    throw new AppError("Conversation not found", 404);
  }

  if (!(await isConnected(senderId, recipientId))) {
    throw new AppError("You can only message users you're connected with", 403);
  }

  const message = toMessageDto(await insertMessage(senderId, recipientId, body));

  emitToUser(recipientId, "message:new", message);
  emitToUser(senderId, "message:new", message);

  await createNotification(recipientId, senderId, "message");

  return message;
}
