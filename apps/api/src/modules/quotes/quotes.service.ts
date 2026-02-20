import * as repo from "./quotes.repository";
import type { QuoteCreate, QuoteItemUpsert, QuoteListQuery, QuoteUpdate } from "./quotes.schema";

export type QuoteServiceError =
  | "CUSTOMER_NOT_FOUND"
  | "PRODUCT_NOT_FOUND"
  | "QUOTE_LOCKED"
  | "INVALID_STATUS";

function toCents(value: number) {
  return Math.round(Number(value) * 100);
}

function fromCents(cents: number) {
  return Math.round(cents) / 100;
}

function toQtyMillis(qty: number) {
  // quote_items.quantity é decimal(18,3) => milésimos
  return Math.round(Number(qty) * 1000);
}

/**
 * totalLinhaCents = round(qtyMillis * unitCents / 1000)
 * - qtyMillis: milésimos
 * - unitCents: centavos
 * => resultado em centavos, com arredondamento consistente
 */
function calcLineTotalCents(qty: number, unitPrice: number) {
  const q = toQtyMillis(qty);
  const u = toCents(unitPrice);
  return Math.round((q * u) / 1000);
}

function normalizeItems(items: QuoteItemUpsert[]) {
  return items.map((i) => {
    const qty = Number(i.quantity);
    const unit = Number(i.unitPrice);

    const totalCents = calcLineTotalCents(qty, unit);

    return {
      productId: i.productId,
      description: i.description,
      quantity: qty,
      unitPrice: fromCents(toCents(unit)),
      total: fromCents(totalCents),
    };
  });
}

function computeTotals(items: Array<{ total: number }>, discount: number) {
  const subtotalCents = items.reduce((acc, it) => acc + toCents(Number(it.total)), 0);
  const discountCents = Math.max(0, toCents(Number(discount ?? 0)));
  const totalCents = Math.max(0, subtotalCents - discountCents);

  return {
    subtotal: fromCents(subtotalCents),
    discount: fromCents(discountCents),
    total: fromCents(totalCents),
  };
}

export async function list(companyId: number, q: QuoteListQuery) {
  return repo.listQuotes(companyId, q);
}

export async function get(companyId: number, id: number) {
  const quote = await repo.getQuote(companyId, id);
  if (!quote) return null;

  const items = await repo.getQuoteItems(companyId, id);
  return { quote, items };
}

export async function create(companyId: number, data: QuoteCreate) {
  const customerOk = await repo.ensureCustomerBelongs(companyId, data.customerId);
  if (!customerOk) return { error: "CUSTOMER_NOT_FOUND" as const };

  const productIds = data.items.map((i) => i.productId);
  const productsOk = await repo.ensureProductsBelong(companyId, productIds);
  if (!productsOk) return { error: "PRODUCT_NOT_FOUND" as const };

  // Normaliza/valida numericamente e calcula totais sem float
  const items = normalizeItems(data.items);
  const totals = computeTotals(items, Number(data.discount ?? 0));

  const created = await repo.createQuoteTx({
    companyId,
    customerId: data.customerId,
    status: "draft",
    notes: data.notes ?? null,
    subtotal: totals.subtotal,
    discount: totals.discount,
    total: totals.total,
    items,
  });

  return { data: created };
}

export async function update(companyId: number, id: number, data: QuoteUpdate) {
  const current = await repo.getQuote(companyId, id);
  if (!current) return null;

  // V2: só edita em draft
  if (current.status !== "draft") return { error: "QUOTE_LOCKED" as const };

  // Se mudou customer, valida pertencimento
  if (typeof data.customerId === "number") {
    const ok = await repo.ensureCustomerBelongs(companyId, data.customerId);
    if (!ok) return { error: "CUSTOMER_NOT_FOUND" as const };
  }

  // Se vierem itens, valida produtos
  if (data.items?.length) {
    const productIds = data.items.map((i) => i.productId);
    const ok = await repo.ensureProductsBelong(companyId, productIds);
    if (!ok) return { error: "PRODUCT_NOT_FOUND" as const };
  }

  // Itens finais (se não vier items, mantém os atuais)
  let items = await repo.getQuoteItems(companyId, id);

  if (data.items) {
    const normalized = normalizeItems(data.items);

    // Substitui todos os itens em transação (V2)
    const ok = await repo.replaceQuoteItemsTx(companyId, id, normalized);
    if (!ok) return null;

    items = await repo.getQuoteItems(companyId, id);
  }

  // Discount final (se não veio, usa o atual)
  const nextDiscount =
    typeof data.discount === "number" ? Number(data.discount) : Number(current.discount ?? 0);

  const totals = computeTotals(items, nextDiscount);

  // Atualiza header + totals (sempre), mas só altera campos opcionais quando vierem
  const updated = await repo.updateQuoteHeaderV2(companyId, id, {
    customerId: typeof data.customerId === "number" ? data.customerId : undefined,

    // notes: permitir "limpar" com null; se não veio, mantém
    notes: typeof data.notes !== "undefined" ? (data.notes ?? null) : undefined,

    // discount: só atualiza o campo se veio no payload
    discount: typeof data.discount === "number" ? totals.discount : undefined,

    subtotal: totals.subtotal,
    total: totals.total,
  });

  if (!updated) return null;

  return { quote: updated, items };
}

export async function approve(companyId: number, id: number) {
  const current = await repo.getQuote(companyId, id);
  if (!current) return null;

  if (current.status !== "draft") return { error: "INVALID_STATUS" as const };

  const updated = await repo.setQuoteStatus(companyId, id, "approved");
  if (!updated) return null;

  return { quote: updated };
}

export async function cancel(companyId: number, id: number) {
  const current = await repo.getQuote(companyId, id);
  if (!current) return null;

  // permite cancelar draft/approved; evita re-cancelar
  if (current.status === "cancelled") return { error: "INVALID_STATUS" as const };

  const updated = await repo.setQuoteStatus(companyId, id, "cancelled");
  if (!updated) return null;

  return { quote: updated };
}
