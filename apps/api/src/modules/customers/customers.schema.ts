import { z } from "zod";

/**
 * Busca/listagem (combobox):
 * GET /customers?q=ana&limit=20&active=1
 */
export const CustomerListQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  active: z.coerce.number().int().optional(), // 1/0 (opcional)
});

export const CustomerCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  document: z.string().trim().min(3).max(20),

  email: z.string().trim().email().optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),

  // novos campos
  person_type: z.enum(["PF", "PJ"]).optional().nullable(),
  ie: z.string().trim().max(30).optional().nullable(),
  mobile: z.string().trim().max(40).optional().nullable(),
  contact_name: z.string().trim().max(120).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  is_active: z.coerce.boolean().optional().nullable(),

  // billing
  billing_address_line1: z.string().trim().max(120).optional().nullable(),
  billing_address_line2: z.string().trim().max(120).optional().nullable(),
  billing_district: z.string().trim().max(80).optional().nullable(),
  billing_city: z.string().trim().max(80).optional().nullable(),
  billing_state: z.string().trim().max(2).optional().nullable(),
  billing_zip_code: z.string().trim().max(12).optional().nullable(),
  billing_country: z.string().trim().max(2).optional().nullable(),

  // shipping
  shipping_address_line1: z.string().trim().max(120).optional().nullable(),
  shipping_address_line2: z.string().trim().max(120).optional().nullable(),
  shipping_district: z.string().trim().max(80).optional().nullable(),
  shipping_city: z.string().trim().max(80).optional().nullable(),
  shipping_state: z.string().trim().max(2).optional().nullable(),
  shipping_zip_code: z.string().trim().max(12).optional().nullable(),
  shipping_country: z.string().trim().max(2).optional().nullable(),
});

export const CustomerUpdateSchema = CustomerCreateSchema.partial();

export type CustomerCreate = z.infer<typeof CustomerCreateSchema>;
export type CustomerUpdate = z.infer<typeof CustomerUpdateSchema>;
export type CustomerListQuery = z.infer<typeof CustomerListQuerySchema>;
