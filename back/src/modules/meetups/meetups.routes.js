import { Router } from "express";

import {
  listController,
  proposeController,
  acceptController,
  declineController,
  cancelController
} from "./meetups.controller.js";

import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", listController);
router.post("/:id", proposeController);
router.patch("/:meetupId/accept", acceptController);
router.patch("/:meetupId/decline", declineController);
router.patch("/:meetupId/cancel", cancelController);

export default router;
