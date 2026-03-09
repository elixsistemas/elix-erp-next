import { api } from "@/shared/api/client";
import type {
  CostCenter,
  CostCenterFormData,
  CostCenterListParams,
} from "./cost-centers.types";

const BASE_URL = "/cost-centers";

export async function listCostCenters(params: CostCenterListParams = {}) {
  const search = new URLSearchParams();

  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.active) search.set("active", params.active);

  const qs = search.toString();
  return api<CostCenter[]>(`${BASE_URL}${qs ? `?${qs}` : ""}`);
}

export async function createCostCenter(data: CostCenterFormData) {
  return api<CostCenter>(BASE_URL, {
    method: "POST",
    body: data,
  });
}

export async function updateCostCenter(id: number, data: Partial<CostCenterFormData>) {
  return api<CostCenter>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export async function deleteCostCenter(id: number) {
  return api<void>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}