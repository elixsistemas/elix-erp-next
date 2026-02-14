import {
  loadQuoteWithItems,
  convertQuoteToSaleTx,
  listSales,
  getSale,
  cancelSaleTx,
  updateSale
} from "./sales.repository";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export async function convertFromQuote(companyId: number, quoteId: number) {
  const loaded = await loadQuoteWithItems(companyId, quoteId);
  if (!loaded) return { error: "QUOTE_NOT_FOUND" as const };

  const { quote, items } = loaded;

  if (quote.status === "cancelled") return { error: "QUOTE_CANCELLED" as const };
  if (quote.status === "approved") return { error: "QUOTE_ALREADY_APPROVED" as const };
  if (!items.length) return { error: "QUOTE_EMPTY" as const };

  const calcItems = items.map((i) => ({
    productId: i.product_id,
    description: i.description,
    quantity: Number(i.quantity),
    unitPrice: round2(Number(i.unit_price)),
    total: round2(Number(i.quantity) * Number(i.unit_price)),
    kind: i.kind
  }));

  const subtotal = round2(calcItems.reduce((acc, it) => acc + it.total, 0));
  const discount = round2(Number(quote.discount ?? 0));
  const total = round2(Math.max(0, subtotal - discount));

  const created = await convertQuoteToSaleTx({
    companyId,
    quoteId: quote.id,
    customerId: quote.customer_id,
    subtotal,
    discount,
    total,
    notes: quote.notes,
    items: calcItems
  });

  return { data: created };
}

export async function list(args: {
  companyId: number;
  from?: string;
  to?: string;
  customerId?: number;
}) {
  return listSales(args);
}

export async function get(companyId: number, saleId: number) {
  return getSale(companyId, saleId);
}

export async function cancel(companyId: number, saleId: number) {
  return cancelSaleTx({ companyId, saleId });
}

export async function update(args: {
  companyId: number;
  saleId: number;
  notes?: string | null;
  paymentMethodId?: number | null;
  paymentTermId?: number | null;
}) {
  return updateSale(args);
}
