import { Router } from "express";

import { updateProfileSchema, manualLocationSchema, gpsLocationSchema } from "./profile.validation.js";

import {
  getMyProfile,
  updateMyProfile,
  searchProfileTags,
  setManualLocation,
  setGpsLocation,
  addPhoto,
  removePhoto,
  setProfilePhoto,
  getProfileVisitors,
  getProfileLikers
} from "./profile.service.js";

import { AppError } from "../../utils/AppError.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { uploadPhotoMiddleware } from "../../middleware/upload.middleware.js";

async function getMeController(req, res) {
  res.json(await getMyProfile(req.userId));
}

async function updateMeController(req, res) {
  const data = updateProfileSchema.parse(req.body);
  res.json(await updateMyProfile(req.userId, data));
}

async function searchTagsController(req, res) {
  res.json(await searchProfileTags(String(req.query.search || "")));
}

async function setManualLocationController(req, res) {
  const data = manualLocationSchema.parse(req.body);
  res.json(await setManualLocation(req.userId, data.locationLabel));
}

async function setGpsLocationController(req, res) {
  const data = gpsLocationSchema.parse(req.body);
  res.json(await setGpsLocation(req.userId, data.latitude, data.longitude));
}

async function uploadPhotoController(req, res) {
  if (!req.file) {
    throw new AppError("No file uploaded", 400);
  }

  const photo = await addPhoto(req.userId, req.file);

  res.status(201).json({
    id: photo.id,
    url: `/uploads/${photo.file_name}`,
    isProfile: photo.is_profile
  });
}

async function deletePhotoController(req, res) {
  await removePhoto(req.userId, Number(req.params.id));
  res.json({ message: "Photo deleted" });
}

async function setProfilePhotoController(req, res) {
  await setProfilePhoto(req.userId, Number(req.params.id));
  res.json({ message: "Profile photo updated" });
}

async function getVisitorsController(req, res) {
  res.json(await getProfileVisitors(req.userId));
}

async function getLikersController(req, res) {
  res.json(await getProfileLikers(req.userId));
}

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
