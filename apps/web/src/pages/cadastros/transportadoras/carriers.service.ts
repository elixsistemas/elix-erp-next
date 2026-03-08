import { api } from "@/shared/api/client";
import type { Carrier } from "./carriers.types";

export async function listCarriers(params?: {
  q?: string;
  active?: "1" | "0";
}) {
  const qs = new URLSearchParams();

  if (params?.q?.trim()) qs.set("q", params.q.trim());
  if (params?.active) qs.set("active", params.active);

  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const data = await api(`/carriers${suffix}`, { auth: true });

  return Array.isArray(data) ? (data as Carrier[]) : [];
}

export async function createCarrier(payload: any) {
  return api("/carriers", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function updateCarrier(id: number, payload: any) {
  return api(`/carriers/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function deleteCarrier(id: number) {
  return api(`/carriers/${id}`, {
    method: "DELETE",
    auth: true,
  });
}