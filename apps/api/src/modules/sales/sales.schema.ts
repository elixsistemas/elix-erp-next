import { z } from "zod";

export const InstallmentSchema = z.object({
  dueDate: z.string().min(10).max(10), // YYYY-MM-DD
  amount: z.number().positive()
});

export const CloseSaleBodySchema = z.object({
  bankAccountId: z.number().int().positive(),
  documentNo: z.string().max(40).optional().nullable(),
  note: z.string().max(500).optional().nullable(),
  installments: z.array(InstallmentSchema).min(1)
});

export type CloseSaleBody = z.infer<typeof CloseSaleBodySchema>;
