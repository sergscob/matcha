import { Router } from "express";

import {
  suggestedController,
  searchController,
  profileDetailController,
  likeController,
  unlikeController,
  blockController,
  unblockController,
  reportController
} from "./discover.controller.js";

import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

// literal paths must come before the "/:id" param route, or
// "/suggested" and "/search" would be swallowed as an :id value.
router.get("/suggested", suggestedController);
router.get("/search", searchController);

router.get("/:id", profileDetailController);
router.post("/:id/like", likeController);
router.delete("/:id/like", unlikeController);
router.post("/:id/block", blockController);
router.delete("/:id/block", unblockController);
router.post("/:id/report", reportController);

export default router;
