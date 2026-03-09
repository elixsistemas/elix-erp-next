import { z } from "zod";

export const costCenterFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Informe o código")
    .max(20, "Máximo de 20 caracteres"),
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome")
    .max(150, "Máximo de 150 caracteres"),
  active: z.boolean(),
  sortOrder: z.number().int().min(0),
});

export type CostCenterFormValues = z.infer<typeof costCenterFormSchema>;