import { api } from "@/shared/api/client";
import type { OrderDetails, OrderRow, OrderStatus, BillOrderResult } from "./orders.types";

export async function createOrder(body: {
  quoteId?: number | null;
  customerId: number;
  notes?: string | null;
  discount: number;
  subtotal: number;
  total: number;
  items: Array<{
    productId: number;
    kind: "product" | "service";
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}) {
  return api<OrderDetails>(`/orders`, { method: "POST", body: JSON.stringify(body) });
}

export async function listOrders(params: {
  from?: string;
  to?: string;
  customerId?: number;
  status?: OrderStatus;
}) {
  const qs = new URLSearchParams();
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.customerId) qs.set("customerId", String(params.customerId));
  if (params.status) qs.set("status", params.status);

  return api<OrderRow[]>(`/orders?${qs.toString()}`);
}

export async function getOrder(orderId: number) {
  try {
    return await api<OrderDetails>(`/orders/${orderId}`);
  } catch (e: any) {
    if (e?.status === 404) return null;
    throw e;
  }
}

export async function cancelOrder(orderId: number) {
  return api(`/orders/${orderId}/cancel`, { method: "POST" });
}

export async function billOrder(orderId: number) {
  return api<BillOrderResult>(`/orders/${orderId}/bill`, { method: "POST" });
}
