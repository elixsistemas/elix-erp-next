import { z } from "zod";

export const AccountsPayableStatusSchema = z.enum([
  "OPEN",
  "PARTIAL",
  "PAID",
  "OVERDUE",
  "CANCELED",
]);

export const AccountsPayableFormSchema = z.object({
  supplierId: z.coerce.number().int().positive("Fornecedor é obrigatório"),
  documentNumber: z.string().trim().max(60).optional().nullable(),
  issueDate: z.string().min(1, "Data de emissão é obrigatória"),
  dueDate: z.string().min(1, "Data de vencimento é obrigatória"),
  competenceDate: z.string().optional().nullable(),
  description: z.string().trim().min(3, "Descrição é obrigatória").max(255),
  amount: z.coerce.number().positive("Valor deve ser maior que zero"),
  paymentConditionId: z.coerce.number().int().positive().optional().nullable(),
  paymentMethodId: z.coerce.number().int().positive().optional().nullable(),
  bankAccountId: z.coerce.number().int().positive().optional().nullable(),
  chartAccountId: z.coerce.number().int().positive().optional().nullable(),
  costCenterId: z.coerce.number().int().positive().optional().nullable(),
  installmentNo: z.coerce.number().int().positive().optional().nullable(),
  installmentCount: z.coerce.number().int().positive().optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export type AccountsPayableFormValues = z.infer<typeof AccountsPayableFormSchema>;