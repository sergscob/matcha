import { z } from "zod";

export const discoverQuerySchema = z.object({
  ageMin: z.coerce.number().int().min(18).max(120).optional(),
  ageMax: z.coerce.number().int().min(18).max(120).optional(),
  popularityMin: z.coerce.number().int().min(0).max(100000).optional(),
  popularityMax: z.coerce.number().int().min(0).max(100000).optional(),
  location: z.string().min(1).max(100).optional(),
  tags: z.string().max(250).optional(),
  sortBy: z.enum(["age", "popularity", "location", "tags"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  offset: z.coerce.number().int().min(0).optional()
});

export const discoverMapQuerySchema = discoverQuerySchema.omit({ sortBy: true, sortOrder: true, limit: true, offset: true });
