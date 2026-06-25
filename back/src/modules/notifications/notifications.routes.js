import { Router } from "express";

import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead
} from "./notifications.service.js";

import { authMiddleware } from "../../middleware/auth.middleware.js";

async function listController(req, res) {
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const offset = Number(req.query.offset) || 0;

  res.json(await getNotifications(req.userId, limit, offset));
}

async function unreadCountController(req, res) {
  res.json({ count: await getUnreadCount(req.userId) });
}

async function markAllReadController(req, res) {
  await markAllNotificationsRead(req.userId);
  res.json({ message: "All notifications marked as read" });
}

async function markOneReadController(req, res) {
  await markNotificationRead(req.userId, Number(req.params.id));
  res.json({ message: "Notification marked as read" });
}

const router = Router();

router.use(authMiddleware);

router.get("/", listController);
router.get("/unread-count", unreadCountController);
router.post("/read-all", markAllReadController);
router.patch("/:id/read", markOneReadController);

export default router;
