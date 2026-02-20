import { z } from "zod";

export const QuoteDraftSchema = z.object({
  customerId: z.coerce.number().int().positive("Selecione um cliente"),
  discount: z.coerce.number().min(0).default(0),
  notes: z.string().max(500).optional().nullable(),
  items: z.array(z.object({
    productId: z.coerce.number().int().positive(),
    description: z.string().min(1).max(255),
    quantity: z.coerce.number().positive(),
    unitPrice: z.coerce.number().min(0),
  })).min(1, "Adicione ao menos 1 item"),
});

export type QuoteDraft = z.infer<typeof QuoteDraftSchema>;
