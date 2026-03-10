import { z } from "zod";

export const brandFormSchema = z.object({
  code: z.string().trim().min(1, "Informe o código").max(30),
  name: z.string().trim().min(2, "Informe o nome").max(150),
  active: z.boolean(),
  sortOrder: z.number().int().min(0),
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;