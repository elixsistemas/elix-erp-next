import { z } from "zod";

export const CustomerUpsertSchema = z.object({
  name: z.string().trim().min(2, "Nome obrigatório").max(160),
  document: z.string().trim().min(3, "Documento obrigatório").max(20),

  person_type: z.enum(["PF", "PJ"]).optional().nullable(),
  ie: z.string().trim().max(30).optional().nullable(),

  email: z.string().trim().email("Email inválido").optional().nullable().or(z.literal("")),
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

export type CustomerUpsertForm = z.infer<typeof CustomerUpsertSchema>;

export const customerFormSchema = CustomerUpsertSchema;
export type CustomerFormValues = CustomerUpsertForm;
