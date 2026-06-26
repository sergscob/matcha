import { z } from "zod";

import { NO_ANGLE_BRACKETS_REGEX, NO_ANGLE_BRACKETS_MESSAGE } from "../../utils/textValidation.js";

const MIN_AGE = 18;

function isAdult(dateStr) {
  const ageMs = Date.now() - new Date(dateStr).getTime();
  return ageMs / (365.25 * 24 * 60 * 60 * 1000) >= MIN_AGE;
}

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).regex(NO_ANGLE_BRACKETS_REGEX, NO_ANGLE_BRACKETS_MESSAGE).optional(),
  lastName: z.string().min(1).max(50).regex(NO_ANGLE_BRACKETS_REGEX, NO_ANGLE_BRACKETS_MESSAGE).optional(),
  email: z.email().max(254).optional(),
  gender: z.enum(["male", "female"]).optional(),
  sexualOrientation: z.enum(["heterosexual", "homosexual", "bisexual"]).optional(),
  bio: z.string().max(500).regex(NO_ANGLE_BRACKETS_REGEX, NO_ANGLE_BRACKETS_MESSAGE).optional(),
  birthDate: z.iso.date().refine(isAdult, "You must be at least 18 years old").optional(),
  tags: z.array(z.string().min(1).max(30)).max(20).optional()
});

export const manualLocationSchema = z.object({
  locationLabel: z.string().min(1).max(100).regex(NO_ANGLE_BRACKETS_REGEX, NO_ANGLE_BRACKETS_MESSAGE)
});

export const gpsLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});
