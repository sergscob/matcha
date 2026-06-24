import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead
} from "./notifications.service.js";

export async function listController(req, res) {
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const offset = Number(req.query.offset) || 0;

  res.json(await getNotifications(req.userId, limit, offset));
}

export async function unreadCountController(req, res) {
  res.json({ count: await getUnreadCount(req.userId) });
}

export async function markAllReadController(req, res) {
  await markAllNotificationsRead(req.userId);
  res.json({ message: "All notifications marked as read" });
}

export async function markOneReadController(req, res) {
  await markNotificationRead(req.userId, Number(req.params.id));
  res.json({ message: "Notification marked as read" });
}
