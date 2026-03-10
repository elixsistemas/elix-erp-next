import { z } from "zod";

export const ProductKitItemFormSchema = z.object({
  componentProductId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().positive("Quantidade deve ser maior que zero"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const ProductKitUpsertSchema = z.object({
  kitProductId: z.coerce.number().int().positive(),
  items: z.array(ProductKitItemFormSchema).min(1, "Informe ao menos um componente"),
});

export type ProductKitUpsertForm = z.infer<typeof ProductKitUpsertSchema>;