import { z } from "zod";

export const CompanyCreateSchema = z.object({
  name: z.string().min(2),
  cnpj: z.string().min(14).max(18).optional().nullable()
});

export const CompanyUpdateSchema = CompanyCreateSchema.partial();

export type CompanyCreate = z.infer<typeof CompanyCreateSchema>;
export type CompanyUpdate = z.infer<typeof CompanyUpdateSchema>;
