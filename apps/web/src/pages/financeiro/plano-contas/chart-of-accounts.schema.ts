import { z } from "zod";

export const chartAccountNatureSchema = z.enum([
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
]);

export const chartAccountKindSchema = z.enum(["synthetic", "analytic"]);

export const chartAccountDreGroupSchema = z
  .enum([
    "gross_revenue",
    "deductions",
    "net_revenue",
    "cogs",
    "operating_expense",
    "financial_result",
    "taxes_on_profit",
    "other_operating_result",
  ])
  .nullable();

export const chartAccountSchema = z.object({
  parentId: z.number().int().positive().nullable(),
  code: z.string().trim().min(1, "Informe o código").max(30),
  name: z.string().trim().min(2, "Informe o nome").max(200),
  nature: chartAccountNatureSchema,
  accountKind: chartAccountKindSchema,
  allowPosting: z.boolean(),
  isResultAccount: z.boolean(),
  dreGroup: chartAccountDreGroupSchema,
  active: z.boolean(),
  sortOrder: z.number().int().min(0),
});

export type ChartAccountFormValues = z.infer<typeof chartAccountSchema>;