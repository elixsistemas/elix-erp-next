import { api } from "@/shared/api/client";
import type { CreateQuoteBody, QuoteDetails, QuoteRow } from "./quotes.types";

// list
export async function listQuotes(params: {
  from?: string;
  to?: string;
  customerId?: number;
  status?: string;
}) {
  const qs = new URLSearchParams();
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.customerId) qs.set("customerId", String(params.customerId));
  if (params.status) qs.set("status", params.status);
  const q = qs.toString();
  return api<QuoteRow[]>(`/quotes${q ? `?${q}` : ""}`);
}

// get
export async function getQuote(id: number) {
  // seu backend atual /quotes/:id precisa retornar quote+items
  // se hoje retornar só header, me avisa que eu adapto pro formato real
  return api<QuoteDetails>(`/quotes/${id}`);
}

// create
export async function createQuote(body: CreateQuoteBody) {
  return api<QuoteDetails>(`/quotes`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// patch (status/discount/notes)
export async function patchQuote(
  id: number,
  body: Partial<{ status: string; discount: number; notes: string | null }>
) {
  return api<QuoteRow>(`/quotes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// gerar venda a partir do orçamento
export async function createSaleFromQuote(quoteId: number) {
  // seu backend tem POST /sales/from-quote/:id
  const r = await api<any>(`/sales/from-quote/${quoteId}`, { method: "POST" });
  const saleId = Number(r?.saleId ?? r?.data?.sale?.id ?? r?.id);
  return { saleId };
}

// gerar pedido a partir do orçamento (front monta o payload e chama POST /orders)
// isso depende de getQuote trazer items
export async function createOrderFromQuote(quoteId: number) {
  const d = await getQuote(quoteId);

  const r = await api<any>(`/orders`, {
    method: "POST",
    body: JSON.stringify({
      quoteId,
      customerId: d.quote.customer_id,
      notes: d.quote.notes ?? null,
      discount: Number(d.quote.discount ?? 0),
      subtotal: Number(d.quote.subtotal),
      total: Number(d.quote.total),
      items: d.items.map((it) => ({
        productId: it.product_id,
        kind: "product", // se você quiser suportar serviço no quote depois, adicionamos
        description: it.description,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unit_price),
        total: Number(it.total),
      })),
    }),
  });

  const orderId = Number(r?.order?.id ?? r?.orderId ?? r?.id);
  return { orderId };
}
