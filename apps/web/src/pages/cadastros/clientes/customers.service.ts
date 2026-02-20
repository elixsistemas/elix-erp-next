import { api } from "@/shared/api/client";
import type { Customer, CustomerCreate, CustomerUpdate, ListCustomersQuery } from "./customers.types";

export async function listCustomers(query: ListCustomersQuery = {}) {
  const qs = new URLSearchParams();
  if (query.q?.trim()) qs.set("q", query.q.trim());
  if (query.limit) qs.set("limit", String(query.limit));
  if (typeof query.active === "number") qs.set("active", String(query.active));

  const url = `/customers${qs.toString() ? `?${qs.toString()}` : ""}`;
  return api<Customer[]>(url);
}

export async function getCustomer(id: number) {
  return api<Customer>(`/customers/${id}`);
}

export async function createCustomer(body: CustomerCreate) {
  return api<Customer>(`/customers`, { method: "POST", body });
}

export async function updateCustomer(id: number, body: CustomerUpdate) {
  return api<Customer>(`/customers/${id}`, { method: "PATCH", body });
}

export async function deleteCustomer(id: number) {
  return api<{ ok: true }>(`/customers/${id}`, { method: "DELETE" });
}
