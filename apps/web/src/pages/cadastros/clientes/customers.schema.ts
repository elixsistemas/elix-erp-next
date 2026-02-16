import { z } from "zod";
const digits = (v: string) => v.replace(/\D/g, "");

export const customerFormSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(140, "Nome muito longo"),

  document: z
    .string()
    .trim()
    .min(1, "CPF/CNPJ é obrigatório")
    .transform((v) => digits(v))
    .refine((v) => v.length === 11 || v.length === 14, "Informe um CPF (11) ou CNPJ (14) válido"),

  email: z.string().trim().optional().nullable()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "E-mail inválido"),

  phone: z.string().trim().optional().nullable().transform((v) => (v ? v : null)),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
