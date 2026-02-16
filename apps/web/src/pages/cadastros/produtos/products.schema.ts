import { z } from "zod";

export const ProductFormSchema = z.object({
  name: z.string().min(2, "Informe o nome"),
  sku: z.string().trim().optional().nullable(),
  ncm: z.string().trim().optional().nullable(),
  ean: z.string().trim().optional().nullable(),
  price: z.coerce.number().min(0, "Preço inválido").default(0),
  cost: z.coerce.number().min(0, "Custo inválido").default(0),
});

export type ProductFormValues = z.infer<typeof ProductFormSchema>;
