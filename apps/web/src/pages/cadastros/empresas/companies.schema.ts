import { z } from "zod";
const digits = (v: string) => v.replace(/\D/g, "");

export const companyFormSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(120, "Nome muito longo"),
  cnpj: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || digits(v).length === 14, "CNPJ deve ter 14 dígitos"),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;
