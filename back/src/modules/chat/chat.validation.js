import { z } from "zod";

export const sendMessageSchema = z.object({
  body: z.string().trim().min(1).max(1024)
});

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional()
});
