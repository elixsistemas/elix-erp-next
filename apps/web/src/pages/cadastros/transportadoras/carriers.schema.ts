import { z } from "zod";
import type { CarrierFormValues } from "./carriers.types";

export const carrierFormSchema = z.object({
  code: z.string().trim().max(30),
  name: z.string().trim().min(2, "Informe o nome"),
  legal_name: z.string().trim().max(200),
  document: z.string().trim().max(20),
  state_registration: z.string().trim().max(30),
  rntrc: z.string().trim().max(30),

  email: z.string().trim().max(150),
  phone: z.string().trim().max(30),
  contact_name: z.string().trim().max(120),

  zip_code: z.string().trim().max(12),
  street: z.string().trim().max(150),
  street_number: z.string().trim().max(30),
  complement: z.string().trim().max(80),
  neighborhood: z.string().trim().max(80),
  city: z.string().trim().max(80),
  state: z.string().trim().max(2),

  vehicle_type: z.string().trim().max(30),
  plate: z.string().trim().max(10),

  notes: z.string().trim().max(500),
  active: z.boolean(),
});

function toNull(value: string) {
  const v = value?.trim();
  return v ? v : null;
}

export function normalizeCarrierPayload(values: CarrierFormValues) {
  return {
    code: toNull(values.code),
    name: values.name.trim(),
    legalName: toNull(values.legal_name),
    document: toNull(values.document),
    stateRegistration: toNull(values.state_registration),
    rntrc: toNull(values.rntrc),

    email: toNull(values.email),
    phone: toNull(values.phone),
    contactName: toNull(values.contact_name),

    zipCode: toNull(values.zip_code),
    street: toNull(values.street),
    streetNumber: toNull(values.street_number),
    complement: toNull(values.complement),
    neighborhood: toNull(values.neighborhood),
    city: toNull(values.city),
    state: toNull(values.state),

    vehicleType: toNull(values.vehicle_type),
    plate: toNull(values.plate),

    notes: toNull(values.notes),
    active: values.active,
  };
}

export const EMPTY_CARRIER_FORM: CarrierFormValues = {
  code: "",
  name: "",
  legal_name: "",
  document: "",
  state_registration: "",
  rntrc: "",

  email: "",
  phone: "",
  contact_name: "",

  zip_code: "",
  street: "",
  street_number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",

  vehicle_type: "",
  plate: "",

  notes: "",
  active: true,
};