import { Router } from "express";

import {
  getMeController,
  updateMeController,
  searchTagsController,
  setManualLocationController,
  setGpsLocationController,
  uploadPhotoController,
  deletePhotoController,
  setProfilePhotoController,
  getVisitorsController,
  getLikersController
} from "./profile.controller.js";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { uploadPhotoMiddleware } from "../../middleware/upload.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/me", getMeController);
router.patch("/me", updateMeController);
router.get("/tags", searchTagsController);
router.put("/location/manual", setManualLocationController);
router.put("/location/gps", setGpsLocationController);
router.post("/photos", uploadPhotoMiddleware, uploadPhotoController);
router.delete("/photos/:id", deletePhotoController);
router.put("/photos/:id/profile", setProfilePhotoController);
router.get("/visitors", getVisitorsController);
router.get("/likers", getLikersController);

export default router;
