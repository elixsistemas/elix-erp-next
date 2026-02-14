import { z } from "zod";

export const createMovementSchema = z.object({
  productId: z.number().int().positive(),
  type: z.enum(["IN", "OUT", "ADJUST_POS", "ADJUST_NEG"]),
  quantity: z.number().int().positive(),
  source: z.string().max(50).optional(),
  sourceId: z.number().int().positive().optional(),
  note: z.string().max(255).optional(),
});

export const listMovementsQuerySchema = z.object({
  productId: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
