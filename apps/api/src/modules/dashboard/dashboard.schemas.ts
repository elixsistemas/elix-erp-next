import { z } from "zod";

export const dashboardFinanceQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
});

export type DashboardFinanceQuery = z.infer<typeof dashboardFinanceQuerySchema>;

// ✅ input interno do service (companyId vem do token)
export type DashboardFinanceInput = {
  companyId: number;
  month?: string;
};
