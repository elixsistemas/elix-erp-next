import { z } from "zod";

export const BrandsListQuerySchema = z.object({
  q: z.string().trim().optional(),
  active: z.union([z.literal("1"), z.literal("0")]).optional(),
});

const BrandBaseSchema = z.object({
  code: z.string().trim().min(1, "Informe o código").max(30),
  name: z.string().trim().min(2, "Informe o nome").max(150),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const BrandCreateSchema = BrandBaseSchema;
export const BrandUpdateSchema = BrandBaseSchema.partial();