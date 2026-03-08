import { api } from "@/shared/api/client";
import type { CarrierVehicle, CarrierOption } from "./carrierVehicles.types";
import type { Carrier } from "../transportadoras/carriers.types";

export async function listCarrierVehicles(params?: {
  q?: string;
  active?: "1" | "0";
  carrierId?: string;
}) {
  const qs = new URLSearchParams();

  if (params?.q?.trim()) qs.set("q", params.q.trim());
  if (params?.active) qs.set("active", params.active);
  if (params?.carrierId?.trim()) qs.set("carrierId", params.carrierId.trim());

  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const data = await api(`/carrier-vehicles${suffix}`, { auth: true });

  return Array.isArray(data) ? (data as CarrierVehicle[]) : [];
}

export async function createCarrierVehicle(payload: unknown) {
  return api("/carrier-vehicles", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function updateCarrierVehicle(id: number, payload: unknown) {
  return api(`/carrier-vehicles/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function deleteCarrierVehicle(id: number) {
  return api(`/carrier-vehicles/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function listCarrierOptions(): Promise<CarrierOption[]> {
  const data = await api("/carriers?active=1", { auth: true });
  const rows = Array.isArray(data) ? (data as Carrier[]) : [];

  return rows.map((row) => ({
    id: row.id,
    legal_name: row.legal_name,
    trade_name: row.trade_name,
  }));
}