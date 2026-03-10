import { z } from "zod";

/**
 * Legado (mantemos pra compatibilidade com a tabela/CK e telas atuais)
 */
export const MovementTypeSchema = z.enum([
  "IN",
  "OUT",
  "ADJUST_POS",
  "ADJUST_NEG",
]);

export type MovementType = z.infer<typeof MovementTypeSchema>;

/**
 * Novo: motivo (ledger-friendly)
 */
export const MovementReasonSchema = z.enum([
  "SALE",
  "PURCHASE_XML",
  "MANUAL",
  "ADJUST",
  "INVENTORY",
  "TRANSFER",
  "RETURN",
]);

export type MovementReason = z.infer<typeof MovementReasonSchema>;

/**
 * Create
 * - mantém type legado
 * - adiciona campos novos opcionais
 */
export const InventoryMovementCreateSchema = z.object({
  productId: z.coerce.number().int().positive(),
  type: MovementTypeSchema,
  quantity: z.coerce.number().int().positive(),

  // legado/UX atual
  source: z.string().trim().min(1).optional(),
  sourceId: z.coerce.number().int().positive().optional(),

  // novos (não quebram chamadas antigas)
  sourceType: z.string().trim().min(1).optional(),
  reason: MovementReasonSchema.optional(),
  idempotencyKey: z.string().trim().min(8).max(120).optional(),
  occurredAt: z.string().datetime().optional(),
  note: z.string().trim().max(255).optional().nullable(),
});

export type InventoryMovementCreate = z.infer<
  typeof InventoryMovementCreateSchema
>;

/**
 * Query
 */
export const InventoryMovementQuerySchema = z.object({
  productId: z.coerce.number().int().positive().optional(),
  type: MovementTypeSchema.optional(),
  reason: MovementReasonSchema.optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type InventoryMovementQuery = z.infer<
  typeof InventoryMovementQuerySchema
>;

/**
 * Query do saldo atual
 */
export const InventoryStockQuerySchema = z.object({
  productId: z.coerce.number().int().positive(),
});

export type InventoryStockQuery = z.infer<typeof InventoryStockQuerySchema>;