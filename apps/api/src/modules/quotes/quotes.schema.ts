import { z } from "zod";

export const QuoteStatusSchema = z.enum(["draft", "approved", "cancelled"]);

// Acrescentar ao quoteItemSchema:
export const quoteItemSchema = z.object({
  productId:   z.number().int().positive().nullable().optional(),
  description: z.string().min(1, "Descrição obrigatória"),
  quantity:    z.number().positive("Quantidade deve ser maior que 0"),
  unitPrice:   z.number().min(0),
  unit:        z.string().max(10).nullable().optional(), // ← novo
});

// Acrescentar ao quoteSchema:
export const quoteSchema = z.object({
  customerId:    z.number().min(1, "Cliente obrigatório"),
  sellerId:      z.number().int().positive().nullable().optional(),
  validUntil:    z.string().nullable().optional(),        // ← novo  (ISO date)
  paymentTerms:  z.string().nullable().optional(),
  paymentMethod: z.string().nullable().optional(),
  freightValue:  z.number().min(0).default(0),            // ← novo  (reais, converte p/ centavos)
  notes:         z.string().nullable().optional(),        // obs do cliente (já existia)
  internalNotes: z.string().nullable().optional(),        // ← novo  obs interna
  items:         z.array(quoteItemSchema).min(1, "Informe ao menos 1 item"),
});

export const QuoteListQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  status: QuoteStatusSchema.optional(),
  from: z.string().trim().min(8).optional(),
  to: z.string().trim().min(8).optional(),
  customerId: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export const QuoteItemUpsertSchema = z.object({
  productId: z.coerce.number().int().positive(),
  description: z.string().trim().min(1).max(255),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0),
});

export const QuoteCreateSchema = z.object({
  customerId: z.coerce.number().int().positive(),
  discount: z.coerce.number().min(0).default(0),
  notes: z.string().max(500).optional().nullable(),
  items: z.array(QuoteItemUpsertSchema).min(1),
});

export const QuoteUpdateSchema = z.object({
  customerId: z.coerce.number().int().positive().optional(),
  discount: z.coerce.number().min(0).optional(),
  notes: z.string().max(500).optional().nullable(),
  items: z.array(QuoteItemUpsertSchema).min(1).optional(),
});

export type QuoteCreate = z.infer<typeof QuoteCreateSchema>;
export type QuoteUpdate = z.infer<typeof QuoteUpdateSchema>;
export type QuoteItemUpsert = z.infer<typeof QuoteItemUpsertSchema>;
export type QuoteListQuery = z.infer<typeof QuoteListQuerySchema>;
