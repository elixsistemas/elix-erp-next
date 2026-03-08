import { z } from "zod";
import type { PaymentMethodFormState } from "./payment-methods.types";

export const paymentMethodFormSchema = z.object({
  code: z.string().trim().max(30),
  name: z.string().trim().min(2, "Informe o nome"),
  type: z.enum([
    "cash",
    "pix",
    "boleto",
    "credit_card",
    "debit_card",
    "bank_transfer",
    "check",
    "wallet",
    "other",
  ]),
  description: z.string().trim().max(200),
  active: z.boolean(),

  allowsInstallments: z.boolean(),
  maxInstallments: z.string(),
  requiresBankAccount: z.boolean(),
  settlementDays: z.string(),
  feePercent: z.string(),
  feeFixed: z.string(),
  integrationType: z.enum(["none", "manual", "gateway", "bank", "acquirer"]),
  externalCode: z.string().trim().max(50),
  isDefault: z.boolean(),
  sortOrder: z.string(),
});

export type PaymentMethodFormParsed = z.infer<typeof paymentMethodFormSchema>;

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

export function normalizePaymentMethodPayload(data: PaymentMethodFormParsed) {
  const maxInstallments = Math.max(1, toInt(data.maxInstallments, 1));

  return {
    code: toNullableString(data.code),
    name: data.name.trim(),
    type: data.type,
    description: toNullableString(data.description),
    active: data.active,

    allowsInstallments: data.allowsInstallments,
    maxInstallments: data.allowsInstallments ? maxInstallments : 1,
    requiresBankAccount: data.requiresBankAccount,
    settlementDays: Math.max(0, toInt(data.settlementDays, 0)),
    feePercent: Math.max(0, toDecimal(data.feePercent, 0)),
    feeFixed: Math.max(0, toDecimal(data.feeFixed, 0)),
    integrationType: data.integrationType,
    externalCode: toNullableString(data.externalCode),
    isDefault: data.isDefault,
    sortOrder: Math.max(0, toInt(data.sortOrder, 0)),
  };
}

export const EMPTY_PAYMENT_METHOD_FORM: PaymentMethodFormState = {
  code: "",
  name: "",
  type: "pix",
  description: "",
  active: true,

  allowsInstallments: false,
  maxInstallments: "1",
  requiresBankAccount: false,
  settlementDays: "0",
  feePercent: "0",
  feeFixed: "0",
  integrationType: "none",
  externalCode: "",
  isDefault: false,
  sortOrder: "0",
};