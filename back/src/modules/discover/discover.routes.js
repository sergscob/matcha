import { Router } from "express";

import { discoverQuerySchema, discoverMapQuerySchema } from "./discover.validation.js";

import {
  getSuggestedProfiles,
  getSearchProfiles,
  getMapProfiles,
  getConnections,
  getProfileDetail,
  likeUser,
  unlikeUser,
  blockUser,
  unblockUser,
  reportUser
} from "./discover.service.js";

import { authMiddleware } from "../../middleware/auth.middleware.js";

function parseFilters(query, schema = discoverQuerySchema) {
  const data = schema.parse(query);

  return {
    ...data,
    tags: data.tags
      ? data.tags.split(",").map(tag => tag.trim().toLowerCase().replace(/^#/, "")).filter(Boolean)
      : undefined
  };
}

async function suggestedController(req, res) {
  res.json(await getSuggestedProfiles(req.userId, parseFilters(req.query)));
}

async function searchController(req, res) {
  res.json(await getSearchProfiles(req.userId, parseFilters(req.query)));
}

async function mapController(req, res) {
  res.json(await getMapProfiles(req.userId, parseFilters(req.query, discoverMapQuerySchema)));
}

async function connectedController(req, res) {
  res.json(await getConnections(req.userId));
}

async function profileDetailController(req, res) {
  res.json(await getProfileDetail(req.userId, Number(req.params.id)));
}

async function likeController(req, res) {
  await likeUser(req.userId, Number(req.params.id));
  res.json({ message: "Liked" });
}

async function unlikeController(req, res) {
  await unlikeUser(req.userId, Number(req.params.id));
  res.json({ message: "Unliked" });
}

async function blockController(req, res) {
  await blockUser(req.userId, Number(req.params.id));
  res.json({ message: "Blocked" });
}

async function unblockController(req, res) {
  await unblockUser(req.userId, Number(req.params.id));
  res.json({ message: "Unblocked" });
}

async function reportController(req, res) {
  await reportUser(req.userId, Number(req.params.id));
  res.json({ message: "Reported" });
}

const router = Router();

router.use(authMiddleware);

router.get("/suggested", suggestedController);
router.get("/search", searchController);
router.get("/map", mapController);
router.get("/connected", connectedController);

router.get("/:id", profileDetailController);
router.post("/:id/like", likeController);
router.delete("/:id/like", unlikeController);
router.post("/:id/block", blockController);
router.delete("/:id/block", unblockController);
router.post("/:id/report", reportController);

export default router;
