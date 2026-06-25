import {
  insertMeetup,
  findMeetupById,
  updateMeetupStatus,
  listMeetupsForUser
} from "./meetups.repository.js";
import { isBlockedEitherWay, hasLiked } from "../discover/discover.repository.js";
import { createNotification } from "../notifications/notifications.service.js";
import { emitToUser } from "../../realtime/socket.js";
import { AppError } from "../../utils/AppError.js";

const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

function isOnline(lastSeen) {
  return Boolean(lastSeen) && Date.now() - new Date(lastSeen).getTime() < ONLINE_THRESHOLD_MS;
}

async function isConnected(userId1, userId2) {
  return (await hasLiked(userId1, userId2)) && (await hasLiked(userId2, userId1));
}

async function getMeetupOrThrow(id) {
  const meetup = await findMeetupById(id);

  if (!meetup) {
    throw new AppError("Meetup not found", 404);
  }

  return meetup;
}

function toBasicDto(row) {
  return {
    id: row.id,
    locationLabel: row.location_label,
    scheduledAt: row.scheduled_at,
    status: row.status,
    createdAt: row.created_at
  };
}

function toListDto(row, viewerId) {
  return {
    ...toBasicDto(row),
    isProposer: row.proposer_id === viewerId,
    otherUser: {
      id: row.other_id,
      username: row.username,
      firstName: row.first_name,
      lastName: row.last_name,
      photoUrl: row.profile_photo ? `/uploads/${row.profile_photo}` : null,
      isOnline: isOnline(row.last_seen)
    }
  };
}

export async function listMeetups(userId) {
  const rows = await listMeetupsForUser(userId);
  return rows.map(row => toListDto(row, userId));
}

export async function proposeMeetup(proposerId, inviteeId, { locationLabel, scheduledAt }) {
  if (proposerId === inviteeId) {
    throw new AppError("You can't schedule a meetup with yourself", 400);
  }

  if (await isBlockedEitherWay(proposerId, inviteeId)) {
    throw new AppError("Profile not found", 404);
  }

  if (!(await isConnected(proposerId, inviteeId))) {
    throw new AppError("You can only schedule meetups with users you're connected with", 403);
  }

  const meetup = await insertMeetup(proposerId, inviteeId, locationLabel, new Date(scheduledAt));

  emitToUser(inviteeId, "meetup:new", {});
  await createNotification(inviteeId, proposerId, "meetup_invite");

  return toBasicDto(meetup);
}

export async function respondToMeetup(meetupId, userId, accept) {
  const meetup = await getMeetupOrThrow(meetupId);

  if (meetup.invitee_id !== userId) {
    throw new AppError("Meetup not found", 404);
  }

  if (meetup.status !== "pending") {
    throw new AppError("This meetup has already been responded to", 400);
  }

  const updated = await updateMeetupStatus(meetupId, accept ? "accepted" : "declined");

  emitToUser(meetup.proposer_id, "meetup:updated", {});
  await createNotification(meetup.proposer_id, userId, accept ? "meetup_accepted" : "meetup_declined");

  return toBasicDto(updated);
}

export async function cancelMeetup(meetupId, userId) {
  const meetup = await getMeetupOrThrow(meetupId);

  if (meetup.proposer_id !== userId && meetup.invitee_id !== userId) {
    throw new AppError("Meetup not found", 404);
  }

  if (meetup.status === "cancelled" || meetup.status === "declined") {
    throw new AppError("This meetup is no longer active", 400);
  }

  const updated = await updateMeetupStatus(meetupId, "cancelled");
  const otherId = meetup.proposer_id === userId ? meetup.invitee_id : meetup.proposer_id;

  emitToUser(otherId, "meetup:updated", {});
  await createNotification(otherId, userId, "meetup_cancelled");

  return toBasicDto(updated);
}
