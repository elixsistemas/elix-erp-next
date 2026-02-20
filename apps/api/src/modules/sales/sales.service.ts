import {
  loadQuoteWithItems,
  convertQuoteToSaleTx,
  listSales,
  getSale,
  getSaleForClosing,
  cancelSaleTx,
  updateSale,
  closeSaleTx,
  closeSaleWithReceivablesTx
} from "./sales.repository";

import { getPaymentTermOffsets } from "../payment_terms/payment_terms.service";
import type { CloseSaleBody } from "./sales.schema";


function toUTCDateString(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDaysUTC(yyyyMmDd: string, days: number) {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return toUTCDateString(dt);
}

function splitAmounts(total: number, n: number) {
  const cents = Math.round(total * 100);
  const base = Math.floor(cents / n);
  const rem = cents - base * n;

  const parts = Array(n).fill(base);
  for (let i = 0; i < rem; i++) parts[i] += 1;

  return parts.map((c: number) => c / 100);
}

export async function previewInstallments(companyId: number, saleId: number) {
  const sale = await getSaleForClosing(companyId, saleId);
  if (!sale) return { error: "SALE_NOT_FOUND" as const };

  const status = String(sale.status ?? "").toLowerCase();
  if (status !== "open") return { error: "SALE_NOT_OPEN" as const };

  if (!sale.payment_method_id) return { error: "PAYMENT_METHOD_REQUIRED" as const };
  if (!sale.payment_term_id) return { error: "PAYMENT_TERM_REQUIRED" as const };

  // busca offsets do payment_term (via service do módulo)
  let offsets: number[];
  try {
    offsets = await getPaymentTermOffsets(companyId, Number(sale.payment_term_id));
  } catch {
    return { error: "PAYMENT_TERM_INVALID" as const };
  }

  const issueDate = toUTCDateString(new Date()); // hoje UTC
  const dueDates = offsets.map((o) => addDaysUTC(issueDate, o));
  const amounts = splitAmounts(Number(sale.total), dueDates.length);

  return {
    data: {
      issueDate,
      total: Number(sale.total),
      installments: dueDates.map((dueDate, i) => ({
        installmentNumber: i + 1,
        dueDate,
        amount: amounts[i]
      }))
    }
  };
}

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

export async function close(companyId: number, saleId: number, body: CloseSaleBody) {
  return closeSaleWithReceivablesTx({
    companyId,
    saleId,
    bankAccountId: body.bankAccountId,
    documentNo: body.documentNo ?? null,
    note: body.note ?? null,
    installments: body.installments
  });
}
