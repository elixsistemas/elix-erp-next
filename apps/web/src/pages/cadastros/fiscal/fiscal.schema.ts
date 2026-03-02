import { z } from "zod";

// no fiscal.schema.ts do WEB
export const CestFormSchema = z.object({
  code: z.string().trim().length(7, "CEST deve ter 7 dígitos"),
  description: z.string().trim().min(3).max(1200),
  segment: z.string().optional().transform((v) => (v?.trim() ? v.trim() : null)),
  active: z.boolean().optional().default(true),
});

export const CfopFormSchema = z.object({
  code: z.string().trim().length(4, "CFOP deve ter 4 dígitos"),
  description: z.string().trim().min(3).max(500),
  nature: z
    .union([z.number().int().min(0).max(255), z.nan()])
    .transform((v) => (Number.isNaN(v) ? null : v)),
  active: z.boolean().default(true),
});
export type CfopForm = z.infer<typeof CfopFormSchema>;

export const NcmFormSchema = z.object({
  code: z.string().trim().length(8, "NCM deve ter 8 dígitos"),
  description: z.string().trim().min(3).max(2000),
  ex: z.string().trim().max(10).optional().nullable().transform((v) => (v ? v : null)),
  start_date: z.string().trim().optional().nullable().transform((v) => (v ? v : null)),
  end_date: z.string().trim().optional().nullable().transform((v) => (v ? v : null)),
  active: z.boolean().default(true),
});
export type NcmForm = z.infer<typeof NcmFormSchema>;