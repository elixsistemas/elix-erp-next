import { z } from "zod";

export const CarrierListQuerySchema = z.object({
  q: z.string().trim().optional(),
  active: z.union([z.literal("1"), z.literal("0")]).optional(),
});

const CarrierBaseSchema = z.object({
  code: z.string().trim().max(30).optional().nullable(),
  name: z.string().trim().min(2, "Informe o nome").max(150),
  legalName: z.string().trim().max(200).optional().nullable(),
  document: z.string().trim().max(20).optional().nullable(),
  stateRegistration: z.string().trim().max(30).optional().nullable(),
  rntrc: z.string().trim().max(30).optional().nullable(),

  email: z.string().trim().email("E-mail inválido").max(150).optional().or(z.literal("")).nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  contactName: z.string().trim().max(120).optional().nullable(),

  zipCode: z.string().trim().max(12).optional().nullable(),
  street: z.string().trim().max(150).optional().nullable(),
  streetNumber: z.string().trim().max(30).optional().nullable(),
  complement: z.string().trim().max(80).optional().nullable(),
  neighborhood: z.string().trim().max(80).optional().nullable(),
  city: z.string().trim().max(80).optional().nullable(),
  state: z.string().trim().max(2).optional().nullable(),

  vehicleType: z.string().trim().max(30).optional().nullable(),
  plate: z.string().trim().max(10).optional().nullable(),

  notes: z.string().trim().max(500).optional().nullable(),
  active: z.boolean().optional(),
});

export const CarrierCreateSchema = CarrierBaseSchema;

export const CarrierUpdateSchema = CarrierBaseSchema.partial();