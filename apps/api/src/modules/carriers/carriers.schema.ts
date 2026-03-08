import { z } from "zod";

export const CarrierListQuerySchema = z.object({
  q: z.string().trim().optional(),
  active: z.union([z.literal("1"), z.literal("0")]).optional(),
});

const DocumentTypeSchema = z.enum(["CPF", "CNPJ"]);

const CarrierBaseSchema = z.object({
  code: z.string().trim().max(30).optional().nullable(),

  legalName: z.string().trim().min(2, "Informe a razão social").max(200),
  tradeName: z.string().trim().max(150).optional().nullable(),

  documentType: DocumentTypeSchema,
  documentNumber: z.string().trim().min(11).max(20),

  stateRegistration: z.string().trim().max(30).optional().nullable(),
  municipalRegistration: z.string().trim().max(30).optional().nullable(),
  rntrc: z.string().trim().max(30).optional().nullable(),

  email: z.string().trim().email("E-mail inválido").max(150).optional().or(z.literal("")).nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  contactName: z.string().trim().max(120).optional().nullable(),

  zipCode: z.string().trim().max(12).optional().nullable(),
  street: z.string().trim().max(150).optional().nullable(),
  number: z.string().trim().max(30).optional().nullable(),
  complement: z.string().trim().max(80).optional().nullable(),
  district: z.string().trim().max(80).optional().nullable(),
  city: z.string().trim().max(80).optional().nullable(),
  state: z.string().trim().length(2, "UF inválida").optional().nullable(),

  notes: z.string().trim().max(500).optional().nullable(),
  active: z.boolean().optional(),
});

export const CarrierCreateSchema = CarrierBaseSchema;

export const CarrierUpdateSchema = CarrierBaseSchema.partial();