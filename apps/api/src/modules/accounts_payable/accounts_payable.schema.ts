import { z } from "zod";

export const AccountsPayableStatusSchema = z.enum([
  "OPEN",
  "PARTIAL",
  "PAID",
  "OVERDUE",
  "CANCELED",
]);

export type AccountsPayableStatus = z.infer<typeof AccountsPayableStatusSchema>;

export const AccountsPayableCreateSchema = z.object({
  supplierId: z.coerce.number().int().positive(),
  documentNumber: z.string().trim().max(60).optional().nullable(),
  issueDate: z.string().date(),
  dueDate: z.string().date(),
  competenceDate: z.string().date().optional().nullable(),
  description: z.string().trim().min(3).max(255),
  amount: z.coerce.number().positive(),
  paymentTermId: z.coerce.number().int().positive().optional().nullable(),
  paymentMethodId: z.coerce.number().int().positive().optional().nullable(),
  bankAccountId: z.coerce.number().int().positive().optional().nullable(),
  chartAccountId: z.coerce.number().int().positive().optional().nullable(),
  costCenterId: z.coerce.number().int().positive().optional().nullable(),
  installmentNo: z.coerce.number().int().positive().optional().nullable(),
  installmentCount: z.coerce.number().int().positive().optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export type AccountsPayableCreate = z.infer<typeof AccountsPayableCreateSchema>;

export const AccountsPayableUpdateSchema = AccountsPayableCreateSchema;

export type AccountsPayableUpdate = z.infer<typeof AccountsPayableUpdateSchema>;

export const AccountsPayableStatusUpdateSchema = z.object({
  status: AccountsPayableStatusSchema,
});

export type AccountsPayableStatusUpdate = z.infer<
  typeof AccountsPayableStatusUpdateSchema
>;

export const AccountsPayableListQuerySchema = z.object({
  supplierId: z.coerce.number().int().positive().optional(),
  status: AccountsPayableStatusSchema.optional(),
  q: z.string().trim().max(120).optional(),
  issueDateFrom: z.string().date().optional(),
  issueDateTo: z.string().date().optional(),
  dueDateFrom: z.string().date().optional(),
  dueDateTo: z.string().date().optional(),
  overdueOnly: z
    .union([z.coerce.number(), z.boolean(), z.string()])
    .optional()
    .transform((v) => {
      if (v === undefined) return false;
      if (typeof v === "boolean") return v;
      if (typeof v === "number") return v === 1;
      return ["1", "true", "yes", "sim"].includes(v.toLowerCase());
    }),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type AccountsPayableListQuery = z.infer<
  typeof AccountsPayableListQuerySchema
>;

export const AccountsPayableIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type AccountsPayableIdParams = z.infer<typeof AccountsPayableIdParamsSchema>;