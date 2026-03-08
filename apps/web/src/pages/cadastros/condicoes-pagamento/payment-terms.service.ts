import { api } from "@/shared/api/client";
import type { PaymentTerm } from "./payment-terms.types";

export async function listPaymentTerms(active?: "1" | "0") {
  const suffix = active ? `?active=${active}` : "";
  const data = await api(`/payment-terms${suffix}`, { auth: true });
  return Array.isArray(data) ? (data as PaymentTerm[]) : [];
}

export async function createPaymentTerm(payload: any) {
  return api("/payment-terms", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function updatePaymentTerm(id: number, payload: any) {
  return api(`/payment-terms/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}