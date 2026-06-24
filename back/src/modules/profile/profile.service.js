import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileTypeFromBuffer } from "file-type";

import {
  getUserById,
  updateUser,
  updateUserLocation,
  getTagsForUser,
  syncUserTags,
  searchTags,
  getPhotosForUser,
  countPhotosForUser,
  insertPhoto,
  findPhotoById,
  deletePhoto as deletePhotoRow,
  setProfilePhoto as setProfilePhotoRow,
  getProfileViewers,
  getLikers
} from "./profile.repository.js";

import { findUserByEmail, createEmailVerification } from "../auth/auth.repository.js";
import { generateSecureToken } from "../../utils/token.js";
import { sendMail } from "../../utils/mailer.js";
import { reverseGeocode, forwardGeocode } from "../../utils/geocoding.js";
import { AppError } from "../../utils/AppError.js";

const MAX_PHOTOS = 5;
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const ALLOWED_EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const UPLOADS_DIR = path.resolve("uploads");
const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function isOnline(lastSeen) {
  return Boolean(lastSeen) && Date.now() - new Date(lastSeen).getTime() < ONLINE_THRESHOLD_MS;
}

function serializeProfile(user, tags, photos) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    gender: user.gender,
    sexualOrientation: user.sexual_orientation,
    bio: user.bio,
    birthDate: user.birth_date,
    locationLabel: user.location_label,
    popularityScore: user.popularity_score,
    verified: user.verified,
    tags,
    photos: photos.map(photo => ({
      id: photo.id,
      url: `/uploads/${photo.file_name}`,
      isProfile: photo.is_profile
    }))
  };
}

export async function getMyProfile(userId) {
  const user = await getUserById(userId);
  const tags = await getTagsForUser(userId);
  const photos = await getPhotosForUser(userId);

  return serializeProfile(user, tags, photos);
}

async function sendVerificationEmail(user) {
  const token = generateSecureToken();

  await createEmailVerification(user.id, token, new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS));

  await sendMail({
    to: user.email,
    subject: "Verify your new email address",
    html: `
      <p>
        Click <a href="${process.env.FRONTEND_URL}/verify-email/${token}">here</a>
        to verify your new email address. This link expires in 24 hours.
      </p>
    `
  });
}

export async function updateMyProfile(userId, data) {
  const currentUser = await getUserById(userId);
  const { tags, ...userFields } = data;

  if (userFields.email && userFields.email !== currentUser.email) {
    const existing = await findUserByEmail(userFields.email);

    if (existing && existing.id !== userId) {
      throw new AppError("Email already in use", 409);
    }

    userFields.verified = false;
  }

  const user = Object.keys(userFields).length ? await updateUser(userId, userFields) : currentUser;

  if (userFields.verified === false) {
    await sendVerificationEmail(user);
  }

  if (tags) {
    const normalized = [...new Set(tags.map(tag => tag.trim().toLowerCase().replace(/^#/, "")))].filter(Boolean);
    await syncUserTags(userId, normalized);
  }

  return getMyProfile(userId);
}

export async function searchProfileTags(query) {
  return searchTags(query);
}

export async function setManualLocation(userId, locationLabel) {
  const coords = await forwardGeocode(locationLabel);

  await updateUserLocation(userId, {
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
    locationLabel,
    locationSource: "manual"
  });

  return getMyProfile(userId);
}

export async function setGpsLocation(userId, latitude, longitude) {
  const label = await reverseGeocode(latitude, longitude);

  await updateUserLocation(userId, {
    latitude,
    longitude,
    locationLabel: label ?? "Unknown location",
    locationSource: "gps"
  });

  return getMyProfile(userId);
}

export async function addPhoto(userId, file) {
  const detected = await fileTypeFromBuffer(file.buffer);

  if (!detected || !ALLOWED_EXTENSIONS[detected.mime]) {
    throw new AppError("Unsupported or invalid image file", 400);
  }

  const count = await countPhotosForUser(userId);

  if (count >= MAX_PHOTOS) {
    throw new AppError(`You can only have up to ${MAX_PHOTOS} photos`, 400);
  }

  const fileName = `${crypto.randomBytes(16).toString("hex")}.${ALLOWED_EXTENSIONS[detected.mime]}`;
  await fs.promises.writeFile(path.join(UPLOADS_DIR, fileName), file.buffer);

  return insertPhoto(userId, fileName, count === 0);
}

export async function removePhoto(userId, photoId) {
  const photo = await findPhotoById(photoId, userId);

  if (!photo) {
    throw new AppError("Photo not found", 404);
  }

  await deletePhotoRow(photoId, userId);
  await fs.promises.unlink(path.join(UPLOADS_DIR, photo.file_name)).catch(() => {});
}

export async function setProfilePhoto(userId, photoId) {
  const photo = await findPhotoById(photoId, userId);

  if (!photo) {
    throw new AppError("Photo not found", 404);
  }

  await setProfilePhotoRow(photoId, userId);
}

export async function getProfileVisitors(userId) {
  const rows = await getProfileViewers(userId);

  return rows.map(row => ({
    id: row.id,
    username: row.username,
    firstName: row.first_name,
    lastName: row.last_name,
    photoUrl: row.profile_photo ? `/uploads/${row.profile_photo}` : null,
    isOnline: isOnline(row.last_seen),
    viewedAt: row.viewed_at,
    likedMe: row.liked_me,
    likedByMe: row.liked_by_me
  }));
}

export async function getProfileLikers(userId) {
  return getLikers(userId);
}
