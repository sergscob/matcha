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

export async function getMeController(req, res) {
  res.json(await getMyProfile(req.userId));
}

export async function updateMeController(req, res) {
  const data = updateProfileSchema.parse(req.body);
  res.json(await updateMyProfile(req.userId, data));
}

export async function searchTagsController(req, res) {
  res.json(await searchProfileTags(String(req.query.search || "")));
}

export async function setManualLocationController(req, res) {
  const data = manualLocationSchema.parse(req.body);
  res.json(await setManualLocation(req.userId, data.locationLabel));
}

export async function setGpsLocationController(req, res) {
  const data = gpsLocationSchema.parse(req.body);
  res.json(await setGpsLocation(req.userId, data.latitude, data.longitude));
}

export async function uploadPhotoController(req, res) {
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

export async function deletePhotoController(req, res) {
  await removePhoto(req.userId, Number(req.params.id));
  res.json({ message: "Photo deleted" });
}

export async function setProfilePhotoController(req, res) {
  await setProfilePhoto(req.userId, Number(req.params.id));
  res.json({ message: "Profile photo updated" });
}

export async function getVisitorsController(req, res) {
  res.json(await getProfileVisitors(req.userId));
}

export async function getLikersController(req, res) {
  res.json(await getProfileLikers(req.userId));
}
