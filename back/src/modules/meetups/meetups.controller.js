import { proposeMeetupSchema } from "./meetups.validation.js";
import {
  listMeetups,
  proposeMeetup,
  respondToMeetup,
  cancelMeetup
} from "./meetups.service.js";

export async function listController(req, res) {
  res.json(await listMeetups(req.userId));
}

export async function proposeController(req, res) {
  const data = proposeMeetupSchema.parse(req.body);

  res.status(201).json(await proposeMeetup(req.userId, Number(req.params.id), data));
}

export async function acceptController(req, res) {
  res.json(await respondToMeetup(Number(req.params.meetupId), req.userId, true));
}

export async function declineController(req, res) {
  res.json(await respondToMeetup(Number(req.params.meetupId), req.userId, false));
}

export async function cancelController(req, res) {
  res.json(await cancelMeetup(Number(req.params.meetupId), req.userId));
}
