import { z } from "zod";

export const ProductKitItemSchema = z.object({
  componentProductId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().positive(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const ProductKitUpsertSchema = z.object({
  kitProductId: z.coerce.number().int().positive(),
  items: z.array(ProductKitItemSchema).min(1, "Informe ao menos um componente"),
});

export const ProductKitListQuerySchema = z.object({
  q: z.string().trim().optional(),
});

export type ProductKitUpsert = z.infer<typeof ProductKitUpsertSchema>;