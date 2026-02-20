import { api } from "@/shared/api/client";
import type { ListSuppliersQuery, Supplier, SupplierCreate, SupplierUpdate } from "./suppliers.types";

export async function listSuppliers(query: ListSuppliersQuery = {}) {
  const qs = new URLSearchParams();
  if (query.q?.trim()) qs.set("q", query.q.trim());
  if (query.limit) qs.set("limit", String(query.limit));
  if (typeof query.active === "number") qs.set("active", String(query.active));

  const url = `/suppliers${qs.toString() ? `?${qs.toString()}` : ""}`;
  return api<Supplier[]>(url);
}

export async function getSupplier(id: number) {
  return api<Supplier>(`/suppliers/${id}`);
}

export async function createSupplier(body: SupplierCreate) {
  return api<Supplier>(`/suppliers`, { method: "POST", body });
}

export async function updateSupplier(id: number, body: SupplierUpdate) {
  return api<Supplier>(`/suppliers/${id}`, { method: "PATCH", body });
}

export async function deleteSupplier(id: number) {
  return api<void>(`/suppliers/${id}`, { method: "DELETE" });
}
