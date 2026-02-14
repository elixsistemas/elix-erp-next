import { z } from "zod";

export const QuoteStatusSchema = z.enum(["draft", "approved", "cancelled"]);

export const QuoteItemCreateSchema = z.object({
  productId: z.coerce.number().int().positive(),
  description: z.string().min(1).max(255),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0)
});

export const QuoteCreateSchema = z.object({
  customerId: z.coerce.number().int().positive(),
  discount: z.coerce.number().min(0).default(0),
  notes: z.string().max(500).optional(),
  items: z.array(QuoteItemCreateSchema).min(1)
});

export const QuoteUpdateSchema = z.object({
  status: QuoteStatusSchema.optional(),
  discount: z.coerce.number().min(0).optional(),
  notes: z.string().max(500).optional()
});

export type QuoteCreate = z.infer<typeof QuoteCreateSchema>;
export type QuoteUpdate = z.infer<typeof QuoteUpdateSchema>;
export type QuoteItemCreate = z.infer<typeof QuoteItemCreateSchema>;
