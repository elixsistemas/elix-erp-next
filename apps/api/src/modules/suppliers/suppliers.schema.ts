import { z } from "zod";

export const SupplierListQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  active: z.coerce.number().int().optional(), // 1/0
});

export const SupplierCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  person_type: z.enum(["PF", "PJ"]).optional().nullable(),
  document: z.string().trim().min(3).max(20),
  ie: z.string().trim().max(30).optional().nullable(),

  email: z.string().trim().max(160).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  mobile: z.string().trim().max(40).optional().nullable(),
  contact_name: z.string().trim().max(160).optional().nullable(),

  notes: z.string().trim().max(4000).optional().nullable(),

  billing_address_line1: z.string().trim().max(120).optional().nullable(),
  billing_address_line2: z.string().trim().max(120).optional().nullable(),
  billing_district: z.string().trim().max(80).optional().nullable(),
  billing_city: z.string().trim().max(80).optional().nullable(),
  billing_state: z.string().trim().max(2).optional().nullable(),
  billing_zip_code: z.string().trim().max(12).optional().nullable(),
  billing_country: z.string().trim().max(2).optional().nullable(),

  shipping_address_line1: z.string().trim().max(120).optional().nullable(),
  shipping_address_line2: z.string().trim().max(120).optional().nullable(),
  shipping_district: z.string().trim().max(80).optional().nullable(),
  shipping_city: z.string().trim().max(80).optional().nullable(),
  shipping_state: z.string().trim().max(2).optional().nullable(),
  shipping_zip_code: z.string().trim().max(12).optional().nullable(),
  shipping_country: z.string().trim().max(2).optional().nullable(),
});

export const SupplierUpdateSchema = SupplierCreateSchema.partial();

export type SupplierCreate = z.infer<typeof SupplierCreateSchema>;
export type SupplierUpdate = z.infer<typeof SupplierUpdateSchema>;
export type SupplierListQuery = z.infer<typeof SupplierListQuerySchema>;
