import { z } from "zod";

export const carrierFormSchema = z.object({
  code: z.string().trim().max(30).optional().or(z.literal("")),
  name: z.string().trim().min(2, "Informe o nome"),
  legalName: z.string().trim().max(200).optional().or(z.literal("")),
  document: z.string().trim().max(20).optional().or(z.literal("")),
  stateRegistration: z.string().trim().max(30).optional().or(z.literal("")),
  rntrc: z.string().trim().max(30).optional().or(z.literal("")),

  email: z.string().trim().max(150).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  contactName: z.string().trim().max(120).optional().or(z.literal("")),

  zipCode: z.string().trim().max(12).optional().or(z.literal("")),
  street: z.string().trim().max(150).optional().or(z.literal("")),
  streetNumber: z.string().trim().max(30).optional().or(z.literal("")),
  complement: z.string().trim().max(80).optional().or(z.literal("")),
  neighborhood: z.string().trim().max(80).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  state: z.string().trim().max(2).optional().or(z.literal("")),

  vehicleType: z.string().trim().max(30).optional().or(z.literal("")),
  plate: z.string().trim().max(10).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  active: z.boolean(),
});

export type CarrierFormValues = z.infer<typeof carrierFormSchema>;

function nullable(v?: string) {
  const x = v?.trim();
  return x ? x : null;
}

export function normalizeCarrierPayload(data: CarrierFormValues) {
  return {
    code: nullable(data.code),
    name: data.name.trim(),
    legalName: nullable(data.legalName),
    document: nullable(data.document),
    stateRegistration: nullable(data.stateRegistration),
    rntrc: nullable(data.rntrc),

    email: nullable(data.email),
    phone: nullable(data.phone),
    contactName: nullable(data.contactName),

    zipCode: nullable(data.zipCode),
    street: nullable(data.street),
    streetNumber: nullable(data.streetNumber),
    complement: nullable(data.complement),
    neighborhood: nullable(data.neighborhood),
    city: nullable(data.city),
    state: nullable(data.state),

    vehicleType: nullable(data.vehicleType),
    plate: nullable(data.plate),
    notes: nullable(data.notes),
    active: data.active,
  };
}