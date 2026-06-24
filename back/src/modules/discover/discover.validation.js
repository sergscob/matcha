import { z } from "zod";

export const discoverQuerySchema = z.object({
  ageMin: z.coerce.number().int().min(18).optional(),
  ageMax: z.coerce.number().int().max(120).optional(),
  popularityMin: z.coerce.number().int().optional(),
  popularityMax: z.coerce.number().int().optional(),
  location: z.string().min(1).optional(),
  tags: z.string().optional(),
  sortBy: z.enum(["age", "popularity", "location", "tags"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  offset: z.coerce.number().int().min(0).optional()
});
