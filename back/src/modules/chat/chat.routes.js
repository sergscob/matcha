import { Router } from "express";

import {
  conversationsController,
  messagesController,
  sendMessageController,
  markReadController
} from "./chat.controller.js";

import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/conversations", conversationsController);
router.get("/:id/messages", messagesController);
router.post("/:id/messages", sendMessageController);
router.post("/:id/read", markReadController);

export default router;
