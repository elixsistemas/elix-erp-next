import { z } from "zod";

export const movementTypeSchema = z.enum(["IN", "OUT", "ADJUST_POS", "ADJUST_NEG"]);

export const createMovementSchema = z.object({
  productId: z.coerce.number().int().positive(),
  type: movementTypeSchema,
  quantity: z.coerce.number().int().positive(),
  source: z.string().trim().min(1).optional(),
  sourceId: z.coerce.number().int().positive().optional(),
  note: z.string().trim().max(255).optional().nullable(),
});

export const listMovementsQuerySchema = z.object({
  productId: z.coerce.number().int().positive().optional(),
  type: movementTypeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});
