import { z } from "zod";

export const proposeMeetupSchema = z.object({
  locationLabel: z.string().trim().min(1).max(255),
  scheduledAt: z.iso.datetime({ local: true }).refine(
    value => new Date(value).getTime() > Date.now(),
    "Meetup time must be in the future"
  )
});
