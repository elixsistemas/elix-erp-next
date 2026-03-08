import { z } from "zod";

export const OffsetsSchema = z.array(z.number().int().min(0)).min(1);

const TermTypeSchema = z.enum(["cash", "installment"]);
const CalcModeSchema = z.enum(["none", "fixed", "percent"]);

export const PaymentTermCreateSchema = z.object({
  code: z.string().trim().min(1).max(30).optional(),
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(200).optional(),
  offsets: OffsetsSchema,
  active: z.boolean().optional(),

  termType: TermTypeSchema.optional(),
  graceDays: z.number().int().min(0).optional(),
  interestMode: CalcModeSchema.optional(),
  interestValue: z.number().min(0).optional(),
  penaltyValue: z.number().min(0).optional(),
  discountMode: CalcModeSchema.optional(),
  discountValue: z.number().min(0).optional(),
  allowsEarlyPaymentDiscount: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const PaymentTermUpdateSchema = z.object({
  code: z.string().trim().min(1).max(30).optional(),
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(200).optional(),
  offsets: OffsetsSchema.optional(),
  active: z.boolean().optional(),

  termType: TermTypeSchema.optional(),
  graceDays: z.number().int().min(0).optional(),
  interestMode: CalcModeSchema.optional(),
  interestValue: z.number().min(0).optional(),
  penaltyValue: z.number().min(0).optional(),
  discountMode: CalcModeSchema.optional(),
  discountValue: z.number().min(0).optional(),
  allowsEarlyPaymentDiscount: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const ListPaymentTermsQuerySchema = z.object({
  active: z.union([z.literal("1"), z.literal("0")]).optional(),
});

export type PaymentTermCreate = z.infer<typeof PaymentTermCreateSchema>;
export type PaymentTermUpdate = z.infer<typeof PaymentTermUpdateSchema>;