import { api } from "@/shared/api/client";
import type {
  Brand,
  BrandFormData,
  BrandListParams,
} from "./brands.types";

const BASE_URL = "/brands";

export async function listBrands(params: BrandListParams = {}) {
  const search = new URLSearchParams();

  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.active) search.set("active", params.active);

  const qs = search.toString();
  return api<Brand[]>(`${BASE_URL}${qs ? `?${qs}` : ""}`);
}

export async function createBrand(data: BrandFormData) {
  return api<Brand>(BASE_URL, {
    method: "POST",
    body: data,
  });
}

export async function updateBrand(id: number, data: Partial<BrandFormData>) {
  return api<Brand>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export async function deleteBrand(id: number) {
  return api<void>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}