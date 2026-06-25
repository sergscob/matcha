import {
  hasProfilePhoto,
  isBlockedEitherWay,
  isBlockedByMe,
  hasLiked,
  insertLike,
  deleteLike,
  insertBlock,
  deleteBlock,
  insertFakeReport,
  recordProfileView,
  queryProfiles
} from "./discover.repository.js";

import { getUserById, incrementPopularity, getTagsForUser, getPhotosForUser } from "../profile/profile.repository.js";
import { createNotification } from "../notifications/notifications.service.js";
import { AppError } from "../../utils/AppError.js";

const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

function isOnline(lastSeen) {
  return Boolean(lastSeen) && Date.now() - new Date(lastSeen).getTime() < ONLINE_THRESHOLD_MS;
}

function toCard(row) {
  return {
    id: row.id,
    username: row.username,
    firstName: row.first_name,
    lastName: row.last_name,
    gender: row.gender,
    age: row.age != null ? Number(row.age) : null,
    locationLabel: row.location_label,
    popularityScore: row.popularity_score,
    commonTags: Number(row.common_tags),
    distanceKm: row.distance_km != null ? Math.round(row.distance_km) : null,
    photoUrl: row.profile_photo ? `/uploads/${row.profile_photo}` : null,
    isOnline: isOnline(row.last_seen)
  };
}

function toMapPoint(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    age: row.age != null ? Number(row.age) : null,
    locationLabel: row.location_label,
    popularityScore: row.popularity_score,
    photoUrl: row.profile_photo ? `/uploads/${row.profile_photo}` : null,
    isOnline: isOnline(row.last_seen),
    latitude: row.latitude,
    longitude: row.longitude
  };
}

export async function getMapProfiles(viewerId, filters) {
  const viewer = await getUserById(viewerId);
  const rows = await queryProfiles(viewer, { ...filters, applyOrientationFilter: true, limit: 200, offset: 0 });

  return rows.filter(row => row.latitude != null).map(toMapPoint);
}

export async function getSuggestedProfiles(viewerId, filters) {
  const viewer = await getUserById(viewerId);
  const rows = await queryProfiles(viewer, { ...filters, applyOrientationFilter: true });

  return rows.map(toCard);
}

export async function getSearchProfiles(viewerId, filters) {
  const viewer = await getUserById(viewerId);
  const rows = await queryProfiles(viewer, { ...filters, applyOrientationFilter: false });

  return rows.map(toCard);
}

export async function getProfileDetail(viewerId, targetId) {
  if (viewerId === targetId) {
    throw new AppError("Use /profile/me to view your own profile", 400);
  }

  const target = await getUserById(targetId);

  if (!target || !target.gender) {
    throw new AppError("Profile not found", 404);
  }

  if (await isBlockedEitherWay(viewerId, targetId)) {
    throw new AppError("Profile not found", 404);
  }

  await recordProfileView(viewerId, targetId);
  await incrementPopularity(targetId, 1);
  await createNotification(targetId, viewerId, "profile_view");

  const tags = await getTagsForUser(targetId);
  const photos = await getPhotosForUser(targetId);
  const likedByMe = await hasLiked(viewerId, targetId);
  const likedByThem = await hasLiked(targetId, viewerId);

  return {
    id: target.id,
    username: target.username,
    firstName: target.first_name,
    lastName: target.last_name,
    gender: target.gender,
    sexualOrientation: target.sexual_orientation,
    birth_date: target.birth_date,
    age: target.birth_date ? Math.floor((Date.now() - new Date(target.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null,
    bio: target.bio,
    locationLabel: target.location_label,
    popularityScore: target.popularity_score + 1,
    tags,
    photos: photos.map(photo => ({
      id: photo.id,
      url: `/uploads/${photo.file_name}`,
      isProfile: photo.is_profile
    })),
    isOnline: isOnline(target.last_seen),
    lastSeen: target.last_seen,
    hasLiked: likedByMe,
    likedByThem,
    isConnected: likedByMe && likedByThem
  };
}

export async function likeUser(actorId, subjectId) {
  if (actorId === subjectId) {
    throw new AppError("You can't like yourself", 400);
  }

  if (await isBlockedEitherWay(actorId, subjectId)) {
    throw new AppError("Profile not found", 404);
  }

  if (!(await hasProfilePhoto(actorId))) {
    throw new AppError("Set a profile photo before liking someone", 400);
  }

  if (await hasLiked(actorId, subjectId)) {
    return;
  }

  const mutual = await hasLiked(subjectId, actorId);

  await insertLike(actorId, subjectId);
  await incrementPopularity(subjectId, 5);
  await createNotification(subjectId, actorId, mutual ? "match" : "like");
}

export async function unlikeUser(actorId, subjectId) {
  if (!(await hasLiked(actorId, subjectId))) {
    return;
  }

  const wasMutual = await hasLiked(subjectId, actorId);

  await deleteLike(actorId, subjectId);
  await incrementPopularity(subjectId, -3);

  if (wasMutual) {
    await createNotification(subjectId, actorId, "unlike");
  }
}

export async function blockUser(blockerId, blockedId) {
  if (blockerId === blockedId) {
    throw new AppError("You can't block yourself", 400);
  }

  if (await isBlockedByMe(blockerId, blockedId)) {
    return;
  }

  await insertBlock(blockerId, blockedId);
  await incrementPopularity(blockedId, -3);
}

export async function unblockUser(blockerId, blockedId) {
  await deleteBlock(blockerId, blockedId);
}

export async function reportUser(reporterId, reportedId) {
  if (reporterId === reportedId) {
    throw new AppError("You can't report yourself", 400);
  }

  await insertFakeReport(reporterId, reportedId);
}
