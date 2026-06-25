import { Router } from "express";

import { proposeMeetupSchema } from "./meetups.validation.js";
import {
  listMeetups,
  proposeMeetup,
  respondToMeetup,
  cancelMeetup
} from "./meetups.service.js";

import { authMiddleware } from "../../middleware/auth.middleware.js";

async function listController(req, res) {
  res.json(await listMeetups(req.userId));
}

async function proposeController(req, res) {
  const data = proposeMeetupSchema.parse(req.body);

  res.status(201).json(await proposeMeetup(req.userId, Number(req.params.id), data));
}

async function acceptController(req, res) {
  res.json(await respondToMeetup(Number(req.params.meetupId), req.userId, true));
}

async function declineController(req, res) {
  res.json(await respondToMeetup(Number(req.params.meetupId), req.userId, false));
}

async function cancelController(req, res) {
  res.json(await cancelMeetup(Number(req.params.meetupId), req.userId));
}

const router = Router();

router.use(authMiddleware);

router.get("/", listController);
router.post("/:id", proposeController);
router.patch("/:meetupId/accept", acceptController);
router.patch("/:meetupId/decline", declineController);
router.patch("/:meetupId/cancel", cancelController);

export default router;
