import { z } from "zod";

const PaymentMethodTypeSchema = z.enum([
  "cash",
  "pix",
  "boleto",
  "credit_card",
  "debit_card",
  "bank_transfer",
  "check",
  "wallet",
  "other",
]);

const IntegrationTypeSchema = z.enum([
  "none",
  "manual",
  "gateway",
  "bank",
  "acquirer",
]);

export const PaymentMethodCreateSchema = z.object({
  code: z.string().trim().min(1).max(30).optional(),
  name: z.string().trim().min(1).max(100),
  type: PaymentMethodTypeSchema,
  description: z.string().trim().max(200).optional(),
  active: z.boolean().optional(),

  allowsInstallments: z.boolean().optional(),
  maxInstallments: z.number().int().min(1).max(999).optional(),
  requiresBankAccount: z.boolean().optional(),
  settlementDays: z.number().int().min(0).max(999).optional(),
  feePercent: z.number().min(0).max(999.9999).optional(),
  feeFixed: z.number().min(0).max(999999999.99).optional(),
  integrationType: IntegrationTypeSchema.optional(),
  externalCode: z.string().trim().max(50).optional(),
  isDefault: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const PaymentMethodUpdateSchema = PaymentMethodCreateSchema.partial();

export const ListPaymentMethodsQuerySchema = z.object({
  active: z.union([z.literal("1"), z.literal("0")]).optional(),
});

export type PaymentMethodCreate = z.infer<typeof PaymentMethodCreateSchema>;
export type PaymentMethodUpdate = z.infer<typeof PaymentMethodUpdateSchema>;