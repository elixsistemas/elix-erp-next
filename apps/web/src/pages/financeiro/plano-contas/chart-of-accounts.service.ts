import { api } from "@/shared/api/client";
import type {
  ChartAccountListFilters,
  ChartAccountNode,
  ChartAccountPayload,
  ChartAccountRow,
} from "./chart-of-accounts.types";

const BASE_URL = "/financial/chart-of-accounts";

export async function listChartAccountsTree() {
  return api<ChartAccountNode[]>(`${BASE_URL}/tree`);
}

export async function listChartAccounts(filters: ChartAccountListFilters = {}) {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.active) params.set("active", filters.active);

  const qs = params.toString();
  return api<ChartAccountRow[]>(`${BASE_URL}${qs ? `?${qs}` : ""}`);
}

export async function createChartAccount(payload: ChartAccountPayload) {
  return api<ChartAccountRow>(BASE_URL, {
    method: "POST",
    body: payload,
  });
}

export async function updateChartAccount(id: number, payload: ChartAccountPayload) {
  return api<ChartAccountRow>(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function updateChartAccountStatus(id: number, active: boolean) {
  return api<ChartAccountRow>(`${BASE_URL}/${id}/status`, {
    method: "PATCH",
    body: { active },
  });
}

export async function removeChartAccount(id: number) {
  return api<void>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}