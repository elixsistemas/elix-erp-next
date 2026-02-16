import { z } from "zod";

export const BankBalanceEventSourceSchema = z.enum(["MANUAL", "OFX", "API", "ADJUSTMENT"]);

export const BankBalanceEventCreateSchema = z.object({
  bankAccountId: z.coerce.number().int().positive(),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // "YYYY-MM-DD"
  amount: z.coerce.number(), // + entrada, - saída
  description: z.string().max(200).optional().nullable(),
  sourceType: BankBalanceEventSourceSchema.optional().default("MANUAL"),
  sourceRef: z.string().max(120).optional().nullable(),
});

export const BankBalanceEventListQuerySchema = z.object({
  bankAccountId: z.coerce.number().int().positive().optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type BankBalanceEventCreateInput = z.infer<typeof BankBalanceEventCreateSchema>;
export type BankBalanceEventListQuery = z.infer<typeof BankBalanceEventListQuerySchema>;
