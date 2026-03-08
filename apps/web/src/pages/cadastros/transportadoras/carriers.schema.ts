import { z } from "zod";
import type { CarrierFormValues } from "./carriers.types";

export const carrierFormSchema = z.object({
  code: z.string().trim().max(30).optional().or(z.literal("")),

  legalName: z.string().trim().min(2, "Informe a razão social").max(200),
  tradeName: z.string().trim().max(150).optional().or(z.literal("")),

  documentType: z.enum(["CPF", "CNPJ"]),
  documentNumber: z.string().trim().min(11, "Informe o CPF/CNPJ").max(20),

  stateRegistration: z.string().trim().max(30).optional().or(z.literal("")),
  municipalRegistration: z.string().trim().max(30).optional().or(z.literal("")),
  rntrc: z.string().trim().max(30).optional().or(z.literal("")),

  email: z
    .string()
    .trim()
    .max(150)
    .refine((v) => !v || /\S+@\S+\.\S+/.test(v), "E-mail inválido")
    .optional()
    .or(z.literal("")),

  phone: z.string().trim().max(30).optional().or(z.literal("")),
  contactName: z.string().trim().max(120).optional().or(z.literal("")),

  zipCode: z.string().trim().max(12).optional().or(z.literal("")),
  street: z.string().trim().max(150).optional().or(z.literal("")),
  number: z.string().trim().max(30).optional().or(z.literal("")),
  complement: z.string().trim().max(80).optional().or(z.literal("")),
  district: z.string().trim().max(80).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  state: z.string().trim().max(2).optional().or(z.literal("")),

  notes: z.string().trim().max(500).optional().or(z.literal("")),
  active: z.boolean(),
});

function nullable(value?: string) {
  const v = value?.trim();
  return v ? v : null;
}

function normalizeDocument(value?: string) {
  const v = value?.replace(/\D/g, "") ?? "";
  return v || null;
}

export function normalizeCarrierPayload(values: CarrierFormValues) {
  return {
    code: nullable(values.code),

    legalName: values.legalName.trim(),
    tradeName: nullable(values.tradeName),

    documentType: values.documentType,
    documentNumber: normalizeDocument(values.documentNumber),

    stateRegistration: nullable(values.stateRegistration),
    municipalRegistration: nullable(values.municipalRegistration),
    rntrc: nullable(values.rntrc),

    email: nullable(values.email)?.toLowerCase() ?? null,
    phone: nullable(values.phone),
    contactName: nullable(values.contactName),

    zipCode: nullable(values.zipCode),
    street: nullable(values.street),
    number: nullable(values.number),
    complement: nullable(values.complement),
    district: nullable(values.district),
    city: nullable(values.city),
    state: nullable(values.state)?.toUpperCase() ?? null,

    notes: nullable(values.notes),
    active: values.active,
  };
}

export const EMPTY_CARRIER_FORM: CarrierFormValues = {
  code: "",

  legalName: "",
  tradeName: "",

  documentType: "CNPJ",
  documentNumber: "",

  stateRegistration: "",
  municipalRegistration: "",
  rntrc: "",

  email: "",
  phone: "",
  contactName: "",

  zipCode: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",

  notes: "",
  active: true,
};