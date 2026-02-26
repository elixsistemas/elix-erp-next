import { api } from "@/shared/api/client";
import type { SaleCreate, SaleRow, SaleUpdate } from "./sales.types";
import type { SaleItemRow } from "./sales.types";

export type SaleDetail = { sale: SaleRow; items: SaleItemRow[] };

export async function fetchSales(params: Record<string, any> = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== "").map(([k, v]) => [k, String(v)])
    )
  ).toString();
  return api<SaleRow[]>(`/sales${qs ? `?${qs}` : ""}`);
}

export const fetchSale       = (id: number) => api<SaleDetail>(`/sales/${id}`);
export const createSale      = (body: SaleCreate) => api<SaleDetail>("/sales", { method: "POST", body });
export const updateSale      = (id: number, body: SaleUpdate) => api<SaleDetail>(`/sales/${id}`, { method: "PATCH", body });
export const completeSale    = (id: number) => api<{ id: number; status: string }>(`/sales/${id}/complete`, { method: "POST" });
export const cancelSale      = (id: number) => api<{ id: number; status: string }>(`/sales/${id}/cancel`, { method: "POST" });
export const saleFromQuote   = (quoteId: number) => api<SaleDetail>(`/sales/from-quote/${quoteId}`, { method: "POST" });
export const saleFromOrder   = (orderId: number) => api<SaleDetail>(`/sales/from-order/${orderId}`, { method: "POST" });
