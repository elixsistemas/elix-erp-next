import { z } from "zod";
import type { PaymentTermFormState } from "./payment-terms.types";

export const paymentTermFormSchema = z.object({
  code: z.string().trim().max(30),
  name: z.string().trim().min(2, "Informe o nome"),
  description: z.string().trim().max(200),
  offsets: z.string().trim().min(1, "Informe os vencimentos"),
  active: z.boolean(),

  termType: z.enum(["cash", "installment"]),
  graceDays: z.string(),
  interestMode: z.enum(["none", "fixed", "percent"]),
  interestValue: z.string(),
  penaltyValue: z.string(),
  discountMode: z.enum(["none", "fixed", "percent"]),
  discountValue: z.string(),
  allowsEarlyPaymentDiscount: z.boolean(),
  isDefault: z.boolean(),
  sortOrder: z.string(),
});

export type PaymentTermFormParsed = z.infer<typeof paymentTermFormSchema>;

function toNullableString(value: string) {
  const v = value.trim();
  return v ? v : undefined;
}

function toInt(value: string, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function toDecimal(value: string, fallback = 0) {
  const normalized = (value ?? "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : fallback;
}

export function parseOffsetsInput(raw: string) {
  const values = raw
    .split(/[;,/ ]+/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => Number(x));

  const valid = values.filter((n) => Number.isFinite(n) && n >= 0).map((n) => Math.trunc(n));

  if (valid.length === 0) {
    throw new Error("Informe ao menos um vencimento válido");
  }

  return valid;
}

export function normalizePaymentTermPayload(data: PaymentTermFormParsed) {
  const offsets = parseOffsetsInput(data.offsets);

  return {
    code: toNullableString(data.code),
    name: data.name.trim(),
    description: toNullableString(data.description),
    offsets,
    active: data.active,
    termType:
      offsets.length === 1 && offsets[0] === 0 ? "cash" : data.termType,
    graceDays: Math.max(0, toInt(data.graceDays, 0)),
    interestMode: data.interestMode,
    interestValue: Math.max(0, toDecimal(data.interestValue, 0)),
    penaltyValue: Math.max(0, toDecimal(data.penaltyValue, 0)),
    discountMode: data.discountMode,
    discountValue: Math.max(0, toDecimal(data.discountValue, 0)),
    allowsEarlyPaymentDiscount: data.allowsEarlyPaymentDiscount,
    isDefault: data.isDefault,
    sortOrder: Math.max(0, toInt(data.sortOrder, 0)),
  };
}

export const EMPTY_PAYMENT_TERM_FORM: PaymentTermFormState = {
  code: "",
  name: "",
  description: "",
  offsets: "0",
  active: true,

  termType: "cash",
  graceDays: "0",
  interestMode: "none",
  interestValue: "0",
  penaltyValue: "0",
  discountMode: "none",
  discountValue: "0",
  allowsEarlyPaymentDiscount: false,
  isDefault: false,
  sortOrder: "0",
};