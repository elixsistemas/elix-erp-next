import { z } from "zod";

export const SaleStatusSchema = z.enum(["draft", "completed", "cancelled"]);

export const SaleListQuerySchema = z.object({
  q:          z.string().trim().min(1).optional(),
  status:     SaleStatusSchema.optional(),
  customerId: z.coerce.number().int().positive().optional(),
  from:       z.string().optional(),
  to:         z.string().optional(),
  limit:      z.coerce.number().int().min(1).max(200).optional(),
});

export const SaleItemSchema = z.object({
  productId:   z.number().int().positive().nullable().optional(),
  description: z.string().min(1).max(255),
  quantity:    z.number().positive(),
  unitPrice:   z.number().min(0),
  unit:        z.string().max(10).nullable().optional(),  // ← novo
});

export const SaleCreateSchema = z.object({
  customerId:    z.number().int().positive(),
  quoteId:       z.number().int().positive().nullable().optional(),
  orderId:       z.number().int().positive().nullable().optional(),
  sellerId:      z.number().int().positive().nullable().optional(),
  discount:      z.number().min(0).default(0),
  freightValue:  z.number().min(0).default(0),            // ← novo
  paymentTerms:  z.string().nullable().optional(),
  paymentMethod: z.string().nullable().optional(),
  notes:         z.string().nullable().optional(),
  internalNotes: z.string().nullable().optional(),        // ← novo
  items: z.array(SaleItemSchema).min(1, "Informe ao menos 1 item"),
});

export const SaleUpdateSchema = SaleCreateSchema
  .omit({ quoteId: true, orderId: true })
  .partial()
  .extend({ items: z.array(SaleItemSchema).min(1).optional() });

export type SaleStatus    = z.infer<typeof SaleStatusSchema>;
export type SaleListQuery = z.infer<typeof SaleListQuerySchema>;
export type SaleCreate    = z.infer<typeof SaleCreateSchema>;
export type SaleUpdate    = z.infer<typeof SaleUpdateSchema>;
export type SaleItem      = z.infer<typeof SaleItemSchema>;
