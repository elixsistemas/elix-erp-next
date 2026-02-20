import { z } from "zod";

export const CompanyCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  cnpj: z.string().trim().min(14).max(18).optional().nullable(),

  legal_name: z.string().trim().max(160).optional().nullable(),
  trade_name: z.string().trim().max(160).optional().nullable(),
  ie: z.string().trim().max(30).optional().nullable(),
  im: z.string().trim().max(30).optional().nullable(),

  email: z.string().trim().email().optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  website: z.string().trim().max(160).optional().nullable(),

  address_line1: z.string().trim().max(120).optional().nullable(),
  address_line2: z.string().trim().max(120).optional().nullable(),
  district: z.string().trim().max(80).optional().nullable(),
  city: z.string().trim().max(80).optional().nullable(),
  state: z.string().trim().max(2).optional().nullable(),
  zip_code: z.string().trim().max(12).optional().nullable(),
  country: z.string().trim().max(2).optional().nullable(),

  default_bank_account_id: z.coerce.number().int().positive().optional().nullable(),

  allow_negative_stock: z.coerce.boolean().optional(),
  is_active: z.coerce.boolean().optional(),
});

export const CompanyUpdateSchema = CompanyCreateSchema.partial();

export type CompanyCreate = z.infer<typeof CompanyCreateSchema>;
export type CompanyUpdate = z.infer<typeof CompanyUpdateSchema>;
