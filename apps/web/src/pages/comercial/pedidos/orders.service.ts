import { api } from "@/shared/api/client";
import type { OrderCreate, OrderRow, OrderUpdate } from "./orders.types";

export type OrderDetail = { order: OrderRow; items: import("./orders.types").OrderItemRow[] };

export const listOrders  = (params?: Record<string, any>) =>
  api<OrderRow[]>("/orders", { method: "GET", ...(params ? { body: undefined } : {}) })
    .then(() => api<OrderRow[]>(`/orders?${new URLSearchParams(
      Object.fromEntries(Object.entries(params ?? {}).filter(([,v]) => v != null).map(([k,v]) => [k, String(v)]))
    )}`));

// versão limpa
export async function fetchOrders(params: Record<string, any> = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== "").map(([k, v]) => [k, String(v)])
    )
  ).toString();
  return api<OrderRow[]>(`/orders${qs ? `?${qs}` : ""}`);
}

export const fetchOrder        = (id: number) => api<OrderDetail>(`/orders/${id}`);
export const createOrder       = (body: OrderCreate) => api<OrderDetail>("/orders", { method: "POST", body });
export const updateOrder       = (id: number, body: OrderUpdate) => api<OrderDetail>(`/orders/${id}`, { method: "PATCH", body });
export const confirmOrder      = (id: number) => api<{ id: number; status: string }>(`/orders/${id}/confirm`, { method: "POST" });
export const cancelOrder       = (id: number) => api<{ id: number; status: string }>(`/orders/${id}/cancel`, { method: "POST" });
export const orderFromQuote    = (quoteId: number) => api<OrderDetail>(`/orders/from-quote/${quoteId}`, { method: "POST" });
