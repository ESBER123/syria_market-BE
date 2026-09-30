import { z } from "zod";

export const createProductSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().max(2000).optional(),
  price: z.number().positive(),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"]),
  size: z.string().max(20).optional(),
  brand: z.string().max(50).optional(),
  city: z.string().max(100).optional(),
  categoryId: z.number().int().positive(),
});
