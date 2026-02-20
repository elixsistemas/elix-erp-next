import { z } from "zod";

export const OffsetsSchema = z.array(z.number().int().min(0)).min(1);

export const PaymentTermCreateSchema = z.object({
  name: z.string().min(1).max(80),
  offsets: OffsetsSchema, // ex.: [0], [30,60], [10,40,70]
  active: z.boolean().optional()
});

export const PaymentTermUpdateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  offsets: OffsetsSchema.optional(),
  active: z.boolean().optional()
});

export const ListPaymentTermsQuerySchema = z.object({
  active: z
    .union([z.literal("1"), z.literal("0")])
    .optional()
});

export type PaymentTermCreate = z.infer<typeof PaymentTermCreateSchema>;
export type PaymentTermUpdate = z.infer<typeof PaymentTermUpdateSchema>;
