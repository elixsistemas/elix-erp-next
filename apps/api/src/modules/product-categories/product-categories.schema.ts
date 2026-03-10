import { z } from "zod";

export const ProductCategoryListQuerySchema = z.object({
  q: z.string().trim().optional(),
  active: z.union([z.literal("1"), z.literal("0")]).optional(),
  parentId: z.coerce.number().int().positive().optional(),
});

const ProductCategoryBaseSchema = z.object({
  parentId: z.number().int().positive().nullable().optional(),
  code: z.string().trim().min(1, "Informe o código").max(30),
  name: z.string().trim().min(2, "Informe o nome").max(150),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const ProductCategoryCreateSchema = ProductCategoryBaseSchema;
export const ProductCategoryUpdateSchema = ProductCategoryBaseSchema.partial();