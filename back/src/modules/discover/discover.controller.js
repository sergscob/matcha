import { discoverQuerySchema, discoverMapQuerySchema } from "./discover.validation.js";

import {
  getSuggestedProfiles,
  getSearchProfiles,
  getMapProfiles,
  getProfileDetail,
  likeUser,
  unlikeUser,
  blockUser,
  unblockUser,
  reportUser
} from "./discover.service.js";

function parseFilters(query, schema = discoverQuerySchema) {
  const data = schema.parse(query);

  return {
    ...data,
    tags: data.tags
      ? data.tags.split(",").map(tag => tag.trim().toLowerCase().replace(/^#/, "")).filter(Boolean)
      : undefined
  };
}

export async function suggestedController(req, res) {
  res.json(await getSuggestedProfiles(req.userId, parseFilters(req.query)));
}

export async function searchController(req, res) {
  res.json(await getSearchProfiles(req.userId, parseFilters(req.query)));
}

export async function mapController(req, res) {
  res.json(await getMapProfiles(req.userId, parseFilters(req.query, discoverMapQuerySchema)));
}

export async function profileDetailController(req, res) {
  res.json(await getProfileDetail(req.userId, Number(req.params.id)));
}

export async function likeController(req, res) {
  await likeUser(req.userId, Number(req.params.id));
  res.json({ message: "Liked" });
}

export async function unlikeController(req, res) {
  await unlikeUser(req.userId, Number(req.params.id));
  res.json({ message: "Unliked" });
}

export async function blockController(req, res) {
  await blockUser(req.userId, Number(req.params.id));
  res.json({ message: "Blocked" });
}

export async function unblockController(req, res) {
  await unblockUser(req.userId, Number(req.params.id));
  res.json({ message: "Unblocked" });
}

export async function reportController(req, res) {
  await reportUser(req.userId, Number(req.params.id));
  res.json({ message: "Reported" });
}
