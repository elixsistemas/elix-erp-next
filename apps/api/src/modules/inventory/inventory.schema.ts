import { z } from "zod";

export const MovementTypeSchema = z.enum(["IN", "OUT", "ADJUST_POS", "ADJUST_NEG"]);
export type MovementType = z.infer<typeof MovementTypeSchema>;

export const InventoryMovementCreateSchema = z.object({
  productId: z.coerce.number().int().positive(),
  type: MovementTypeSchema,
  quantity: z.coerce.number().int().positive(), // sua SP usa INT
  source: z.string().trim().min(1).optional(),
  sourceId: z.coerce.number().int().positive().optional(),
  note: z.string().trim().max(255).optional().nullable(),
});

export type InventoryMovementCreate = z.infer<typeof InventoryMovementCreateSchema>;

export const InventoryMovementQuerySchema = z.object({
  productId: z.coerce.number().int().positive().optional(),
  type: MovementTypeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type InventoryMovementQuery = z.infer<typeof InventoryMovementQuerySchema>;

// opcional (para tela de saldo atual)
export const InventoryStockQuerySchema = z.object({
  productId: z.coerce.number().int().positive().optional(),
});

export type InventoryStockQuery = z.infer<typeof InventoryStockQuerySchema>;
