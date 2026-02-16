// dashboard.service.ts
import { api } from "@/shared/api/client";
import type { FinanceSummary } from "./dashboard.types";

export async function getFinanceSummary(month?: string) {
  const qs = new URLSearchParams();
  if (month) qs.set("month", month);

  // ⚠️ usa auth:true (se seu endpoint exige token)
  const data = await api(`/dashboard/finance/summary?${qs.toString()}`, {
    auth: true,
  });

  return data as FinanceSummary;
}
