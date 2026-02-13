import { z } from "zod";

export const ProductCreateSchema = z.object({
  name: z.string().min(2),
  sku: z.string().trim().min(1).optional(),
  ncm: z.string().trim().min(1).optional(),
  ean: z.string().trim().min(1).optional(),
  price: z.coerce.number().min(0).default(0),
  cost: z.coerce.number().min(0).default(0)
});

export const ProductUpdateSchema = ProductCreateSchema.partial();

export type ProductCreate = z.infer<typeof ProductCreateSchema>;
export type ProductUpdate = z.infer<typeof ProductUpdateSchema>;
