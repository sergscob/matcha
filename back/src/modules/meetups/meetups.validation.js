import { z } from "zod";

import { NO_ANGLE_BRACKETS_REGEX, NO_ANGLE_BRACKETS_MESSAGE } from "../../utils/textValidation.js";

export const proposeMeetupSchema = z.object({
  locationLabel: z.string().trim().min(1).max(255).regex(NO_ANGLE_BRACKETS_REGEX, NO_ANGLE_BRACKETS_MESSAGE),
  scheduledAt: z.iso.datetime({ local: true }).refine(
    value => new Date(value).getTime() > Date.now(),
    "Meetup time must be in the future"
  )
});
