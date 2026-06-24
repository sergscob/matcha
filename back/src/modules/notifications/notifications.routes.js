import { Router } from "express";

import {
  listController,
  unreadCountController,
  markAllReadController,
  markOneReadController
} from "./notifications.controller.js";

import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", listController);
router.get("/unread-count", unreadCountController);
router.post("/read-all", markAllReadController);
router.patch("/:id/read", markOneReadController);

export default router;
