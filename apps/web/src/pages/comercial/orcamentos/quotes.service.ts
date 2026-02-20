import { api } from "@/shared/api/client";
import type {
  CustomerMini,
  ProductMini,
  QuoteCreate,
  QuoteDetails,
  QuoteListQuery,
  QuoteListRow,
  QuoteUpdate,
} from "./quotes.types";

export async function listQuotes(query: QuoteListQuery = {}) {
  const qs = new URLSearchParams();
  if (query.q?.trim()) qs.set("q", query.q.trim());
  if (query.status) qs.set("status", query.status);
  if (query.from) qs.set("from", query.from);
  if (query.to) qs.set("to", query.to);
  if (query.customerId) qs.set("customerId", String(query.customerId));
  if (query.limit) qs.set("limit", String(query.limit));

  const url = `/quotes${qs.toString() ? `?${qs.toString()}` : ""}`;
  return api<QuoteListRow[]>(url);
}

export function getQuote(id: number) {
  return api<QuoteDetails>(`/quotes/${id}`);
}

export function createQuote(body: QuoteCreate) {
  return api<QuoteDetails>(`/quotes`, { method: "POST", body });
}

export function updateQuote(id: number, body: QuoteUpdate) {
  return api<QuoteDetails>(`/quotes/${id}`, { method: "PATCH", body });
}

export function approveQuote(id: number) {
  return api<{ quote: any }>(`/quotes/${id}/approve`, { method: "POST" });
}

export function cancelQuote(id: number) {
  return api<{ quote: any }>(`/quotes/${id}/cancel`, { method: "POST" });
}

// Combobox (busca)
export function searchCustomers(q: string) {
  const qs = new URLSearchParams();
  qs.set("q", q);
  qs.set("limit", "20");
  qs.set("active", "1");
  return api<CustomerMini[]>(`/customers?${qs.toString()}`);
}

export function searchProducts(q: string) {
  const qs = new URLSearchParams();
  qs.set("q", q);
  qs.set("limit", "20");
  qs.set("active", "1");
  return api<ProductMini[]>(`/products?${qs.toString()}`);
}

export function getMyCompany() {
  return api<any>("/companies/me");
}

export function getCustomer(id: number) {
  return api<any>(`/customers/${id}`);
}
