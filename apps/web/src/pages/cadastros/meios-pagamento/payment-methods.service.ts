import { api } from "@/shared/api/client";
import type { PaymentMethod } from "./payment-methods.types";

export async function listPaymentMethods(active?: "1" | "0") {
  const suffix = active ? `?active=${active}` : "";
  const data = await api(`/payment-methods${suffix}`, { auth: true });
  return Array.isArray(data) ? (data as PaymentMethod[]) : [];
}

export async function createPaymentMethod(payload: any) {
  return api("/payment-methods", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function updatePaymentMethod(id: number, payload: any) {
  return api(`/payment-methods/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function deactivatePaymentMethod(id: number) {
  return api(`/payment-methods/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function activatePaymentMethod(id: number) {
  return api(`/payment-methods/${id}/activate`, {
    method: "PATCH",
    auth: true,
  });
}