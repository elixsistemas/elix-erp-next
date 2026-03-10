import { z } from "zod";

export const productCategoryFormSchema = z.object({
  parentId: z.number().int().positive().nullable(),
  code: z.string().trim().min(1, "Informe o código").max(30),
  name: z.string().trim().min(2, "Informe o nome").max(150),
  active: z.boolean(),
  sortOrder: z.number().int().min(0),
});

export type ProductCategoryFormValues = z.infer<typeof productCategoryFormSchema>;