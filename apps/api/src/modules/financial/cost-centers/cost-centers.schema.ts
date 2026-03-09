import { z } from "zod";

export const CostCenterListQuerySchema = z.object({
  q: z.string().trim().optional(),
  active: z.union([z.literal("1"), z.literal("0")]).optional(),
});

const CostCenterBaseSchema = z.object({
  code: z.string().trim().min(1, "Informe o código").max(20),
  name: z.string().trim().min(2, "Informe o nome").max(150),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const CostCenterCreateSchema = CostCenterBaseSchema;
export const CostCenterUpdateSchema = CostCenterBaseSchema.partial();