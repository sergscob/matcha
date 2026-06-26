import { z } from "zod";

import { NO_ANGLE_BRACKETS_REGEX, NO_ANGLE_BRACKETS_MESSAGE } from "../../utils/textValidation.js";

export const sendMessageSchema = z.object({
  body: z.string().trim().min(1).max(1024).regex(NO_ANGLE_BRACKETS_REGEX, NO_ANGLE_BRACKETS_MESSAGE)
});

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional()
});
