import {
  createNotification as insertNotification,
  listNotifications,
  countUnread,
  markAllRead,
  markOneRead
} from "./notifications.repository.js";
import { emitToUser } from "../../realtime/socket.js";

export async function createNotification(userId, actorId, type) {
  await insertNotification(userId, actorId, type);
  emitToUser(userId, "notification:new", { type });
}

export async function getNotifications(userId, limit = 20, offset = 0) {
  const rows = await listNotifications(userId, limit, offset);

  return rows.map(row => ({
    id: row.id,
    type: row.type,
    isRead: row.is_read,
    createdAt: row.created_at,
    actor: row.actor_id ? { id: row.actor_id, username: row.actor_username } : null
  }));
}

export async function getUnreadCount(userId) {
  return countUnread(userId);
}

export async function markAllNotificationsRead(userId) {
  await markAllRead(userId);
}

export async function markNotificationRead(userId, id) {
  await markOneRead(id, userId);
}
