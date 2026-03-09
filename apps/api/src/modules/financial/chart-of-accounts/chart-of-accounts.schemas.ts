import { z } from "zod";

export const ChartAccountNatureSchema = z.enum([
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
]);

export const ChartAccountKindSchema = z.enum([
  "synthetic",
  "analytic",
]);

export const ChartAccountDreGroupSchema = z.enum([
  "gross_revenue",
  "deductions",
  "net_revenue",
  "cogs",
  "operating_expense",
  "financial_result",
  "taxes_on_profit",
  "other_operating_result",
]).nullable().optional();

export const ChartAccountListQuerySchema = z.object({
  search: z.string().trim().optional(),
  active: z
    .union([
      z.literal("true"),
      z.literal("false"),
      z.literal("1"),
      z.literal("0"),
    ])
    .optional(),
  parentId: z.coerce.number().int().positive().optional(),
  nature: ChartAccountNatureSchema.optional(),
  accountKind: ChartAccountKindSchema.optional(),
});

export const CreateChartAccountSchema = z.object({
  parentId: z.number().int().positive().nullable().optional(),
  code: z.string().trim().min(1).max(30),
  name: z.string().trim().min(2).max(200),
  nature: ChartAccountNatureSchema,
  accountKind: ChartAccountKindSchema,
  allowPosting: z.boolean().optional(),
  isResultAccount: z.boolean().optional(),
  dreGroup: ChartAccountDreGroupSchema,
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const UpdateChartAccountSchema = z.object({
  parentId: z.number().int().positive().nullable().optional(),
  code: z.string().trim().min(1).max(30).optional(),
  name: z.string().trim().min(2).max(200).optional(),
  nature: ChartAccountNatureSchema.optional(),
  accountKind: ChartAccountKindSchema.optional(),
  allowPosting: z.boolean().optional(),
  isResultAccount: z.boolean().optional(),
  dreGroup: ChartAccountDreGroupSchema,
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const UpdateChartAccountStatusSchema = z.object({
  active: z.boolean(),
});

export type ChartAccountNature = z.infer<typeof ChartAccountNatureSchema>;
export type ChartAccountKind = z.infer<typeof ChartAccountKindSchema>;
export type CreateChartAccountInput = z.infer<typeof CreateChartAccountSchema>;
export type UpdateChartAccountInput = z.infer<typeof UpdateChartAccountSchema>;
export type UpdateChartAccountStatusInput = z.infer<
  typeof UpdateChartAccountStatusSchema
>;
export type ChartAccountListQuery = z.infer<typeof ChartAccountListQuerySchema>;