import { api } from "@/shared/api/client";
import type {
  ListServicesQuery,
  Service,
  ServiceCreate,
  ServiceUpdate,
} from "./services.types";

export async function listServices(
  query: ListServicesQuery = {},
): Promise<Service[]> {
  const qs = new URLSearchParams();

  if (query.q?.trim()) qs.set("q", query.q.trim());
  if (query.limit) qs.set("limit", String(query.limit));
  if (typeof query.active === "number") qs.set("active", String(query.active));

  const url = `/services${qs.toString() ? `?${qs.toString()}` : ""}`;
  return api<Service[]>(url);
}

export async function getService(id: number): Promise<Service> {
  return api<Service>(`/services/${id}`);
}

export async function createService(body: ServiceCreate): Promise<Service> {
  return api<Service>(`/services`, { method: "POST", body });
}

export async function updateService(
  id: number,
  body: ServiceUpdate,
): Promise<Service> {
  return api<Service>(`/services/${id}`, { method: "PATCH", body });
}

export async function deleteService(id: number): Promise<Service> {
  return api<Service>(`/services/${id}`, { method: "DELETE" });
}