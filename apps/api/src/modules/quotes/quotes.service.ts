import * as repo from "./quotes.repository";
import type { QuoteCreate, QuoteUpdate } from "./quotes.schema";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export async function create(companyId: number, data: QuoteCreate) {
  const customerOk = await repo.ensureCustomerBelongs(companyId, data.customerId);
  if (!customerOk) return { error: "CUSTOMER_NOT_FOUND" as const };

  const productIds = data.items.map((i) => i.productId);
  const productsOk = await repo.ensureProductsBelong(companyId, productIds);
  if (!productsOk) return { error: "PRODUCT_NOT_FOUND" as const };

  // Calcula itens e totais (não confia no front)
  const items = data.items.map((i) => {
    const itemTotal = round2(Number(i.quantity) * Number(i.unitPrice));
    return {
      productId: i.productId,
      description: i.description,
      quantity: Number(i.quantity),
      unitPrice: round2(Number(i.unitPrice)),
      total: itemTotal
    };
  });

  const subtotal = round2(items.reduce((acc, it) => acc + it.total, 0));
  const discount = round2(Number(data.discount ?? 0));
  const total = round2(Math.max(0, subtotal - discount)); // não deixa negativo aqui

  const created = await repo.createQuoteTx({
    companyId,
    customerId: data.customerId,
    discount,
    notes: data.notes,
    subtotal,
    total,
    items
  });

  return { data: created };
}

export async function list(companyId: number) {
  return repo.listQuotes(companyId);
}

export async function get(companyId: number, id: number) {
  const quote = await repo.getQuote(companyId, id);
  if (!quote) return null;
  const items = await repo.getQuoteItems(companyId, id);
  return { quote, items };
}

export async function update(companyId: number, id: number, data: QuoteUpdate) {
  const updated = await repo.updateQuoteHeader(companyId, id, data);
  if (!updated) return null;

  // Se alterou discount, recalcula total com base nos itens já existentes
  if (typeof data.discount === "number") {
    const items = await repo.getQuoteItems(companyId, id);
    const subtotal = round2(items.reduce((acc, it) => acc + Number(it.total), 0));
    const discount = round2(Number(data.discount));
    const total = round2(Math.max(0, subtotal - discount));
    await repo.setQuoteTotals(companyId, id, subtotal, discount, total);

    return {
      quote: await repo.getQuote(companyId, id),
      items
    };
  }

  return { quote: updated, items: await repo.getQuoteItems(companyId, id) };
}
