import { z } from "zod";

export const MovementTypeSchema = z.enum(["IN", "OUT", "ADJUST"]);

export const InventoryMovementCreateSchema = z.object({
  productId: z.coerce.number().int().positive(),
  type: MovementTypeSchema,
  quantity: z.coerce.number().positive(), // sempre > 0
  source: z.string().min(2).max(30),      // 'manual', 'sale', 'purchase', 'xml'
  sourceId: z.coerce.number().int().positive().optional(),
  note: z.string().max(255).optional()
});

export const InventoryMovementQuerySchema = z.object({
  productId: z.coerce.number().int().positive().optional(),
  type: MovementTypeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50)
});

export type InventoryMovementCreate = z.infer<typeof InventoryMovementCreateSchema>;
export type InventoryMovementQuery = z.infer<typeof InventoryMovementQuerySchema>;
