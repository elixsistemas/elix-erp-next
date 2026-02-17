// apps/api/src/modules/inventory_movements/inventory_movements.schemas.ts
import { z } from "zod";

export const movementTypeSchema = z.enum(["IN", "OUT", "ADJUST_POS", "ADJUST_NEG"]);

export const movementReasonSchema = z.enum([
  "SALE",
  "PURCHASE_XML",
  "MANUAL",
  "ADJUST",
  "INVENTORY",
  "TRANSFER",
  "RETURN",
]);

export const createMovementSchema = z.object({
  productId: z.coerce.number().int().positive(),
  type: movementTypeSchema,
  quantity: z.coerce.number().int().positive(),

  source: z.string().trim().min(1).optional(),
  sourceId: z.coerce.number().int().positive().optional(),

  // ✅ novos
  sourceType: z.string().trim().min(1).optional(),
  reason: movementReasonSchema.optional(),
  idempotencyKey: z.string().trim().min(8).max(120).optional(),
  occurredAt: z.string().datetime().optional(),

  note: z.string().trim().max(255).optional().nullable(),
});

export const listMovementsQuerySchema = z.object({
  productId: z.coerce.number().int().positive().optional(),
  type: movementTypeSchema.optional(),
  reason: movementReasonSchema.optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});
