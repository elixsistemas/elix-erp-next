import * as repo from "./sales.repository";
import { getPool } from "../../config/db";
import sql from "mssql";
import type { SaleCreate, SaleListQuery, SaleUpdate } from "./sales.schema";

type Ok<T>  = { data: T };
type Err<E> = { error: E };
export type SaleServiceError =
  | "CUSTOMER_NOT_FOUND"
  | "PRODUCT_NOT_FOUND"
  | "SELLER_NOT_FOUND"
  | "SALE_NOT_FOUND"
  | "SALE_LOCKED"
  | "INVALID_STATUS"
  | "QUOTE_NOT_FOUND_OR_NOT_APPROVED"
  | "ORDER_NOT_FOUND_OR_NOT_CONFIRMED";

const ok  = <T>(data: T): Ok<T>   => ({ data });
const err = <E>(e: E):    Err<E>  => ({ error: e });

// ── list ─────────────────────────────────────────────────────
export async function list(companyId: number, query: SaleListQuery) {
  return ok(await repo.listSales(companyId, query));
}

// ── get ──────────────────────────────────────────────────────
export async function get(companyId: number, id: number) {
  const sale = await repo.getSale(companyId, id);
  if (!sale) return err<SaleServiceError>("SALE_NOT_FOUND");
  const items = await repo.getSaleItems(companyId, id);
  return ok({ sale, items });
}

// ── helper: resolve seller ───────────────────────────────────
async function resolveSeller(companyId: number, sellerId?: number | null) {
  if (!sellerId) return { sellerId: null, sellerName: null, error: null };
  const name = await repo.resolveSellerName(companyId, sellerId);
  if (!name) return { sellerId: null, sellerName: null, error: "SELLER_NOT_FOUND" as SaleServiceError };
  return { sellerId, sellerName: name, error: null };
}

// ── create ───────────────────────────────────────────────────
export async function create(companyId: number, args: SaleCreate) {
  const ok1 = await repo.ensureCustomerBelongs(companyId, args.customerId);
  if (!ok1) return err<SaleServiceError>("CUSTOMER_NOT_FOUND");

  const productIds = args.items.map(i => i.productId).filter((id): id is number => !!id);
  if (productIds.length) {
    const ok2 = await repo.ensureProductsBelong(companyId, productIds);
    if (!ok2) return err<SaleServiceError>("PRODUCT_NOT_FOUND");
  }

  const seller = await resolveSeller(companyId, args.sellerId);
  if (seller.error) return err<SaleServiceError>(seller.error);

  const saleId = await repo.createSaleTx(
    companyId, args.customerId,
    args.quoteId ?? null, args.orderId ?? null,
    seller.sellerId, seller.sellerName,
    {
      discount:      args.discount,
      freightValue:  args.freightValue,   // ← novo
      paymentTerms:  args.paymentTerms,
      paymentMethod: args.paymentMethod,
      notes:         args.notes,
      internalNotes: args.internalNotes,  // ← novo
    },
    args.items
  );

  const sale  = await repo.getSale(companyId, saleId);
  const items = await repo.getSaleItems(companyId, saleId);
  return ok({ sale: sale!, items });
}

// ── update ───────────────────────────────────────────────────
export async function update(companyId: number, id: number, args: SaleUpdate) {
  const sale = await repo.getSale(companyId, id);
  if (!sale) return err<SaleServiceError>("SALE_NOT_FOUND");
  if (sale.status !== "draft") return err<SaleServiceError>("SALE_LOCKED");

  if (args.customerId) {
    const ok1 = await repo.ensureCustomerBelongs(companyId, args.customerId);
    if (!ok1) return err<SaleServiceError>("CUSTOMER_NOT_FOUND");
  }
  if (args.items) {
    const productIds = args.items.map(i => i.productId).filter((id): id is number => !!id);
    if (productIds.length) {
      const ok2 = await repo.ensureProductsBelong(companyId, productIds);
      if (!ok2) return err<SaleServiceError>("PRODUCT_NOT_FOUND");
    }
  }

  const seller = await resolveSeller(companyId, args.sellerId);
  if (seller.error) return err<SaleServiceError>(seller.error);

  await repo.updateSaleV2(
    companyId, id,
    seller.sellerId, seller.sellerName,
    args, args.items
  );

  const updated = await repo.getSale(companyId, id);
  const items   = await repo.getSaleItems(companyId, id);
  return ok({ sale: updated!, items });
}

// ── complete ─────────────────────────────────────────────────
export async function complete(companyId: number, id: number) {
  const sale = await repo.getSale(companyId, id);
  if (!sale) return err<SaleServiceError>("SALE_NOT_FOUND");
  if (sale.status !== "draft") return err<SaleServiceError>("INVALID_STATUS");
  const done = await repo.completeSaleTx(companyId, id);
  if (!done) return err<SaleServiceError>("SALE_NOT_FOUND"); // ou erro mais específico
  return ok({ id, status: "completed" });
}

// ── cancel ───────────────────────────────────────────────────
export async function cancel(companyId: number, id: number) {
  const sale = await repo.getSale(companyId, id);
  if (!sale) return err<SaleServiceError>("SALE_NOT_FOUND");
  if (sale.status === "cancelled") return err<SaleServiceError>("INVALID_STATUS");
  await repo.setSaleStatus(companyId, id, "cancelled");
  return ok({ id, status: "cancelled" });
}

// ── createFromQuote ──────────────────────────────────────────
export async function createFromQuote(companyId: number, quoteId: number) {
  const pool = await getPool();

  const { recordset: qr } = await pool.request()
    .input("company_id", sql.Int, companyId)
    .input("id",         sql.Int, quoteId)
    .query(`SELECT * FROM dbo.quotes
            WHERE company_id = @company_id AND id = @id AND status = 'approved'`);
  if (!qr[0]) return err<SaleServiceError>("QUOTE_NOT_FOUND_OR_NOT_APPROVED");

  const { recordset: ir } = await pool.request()
    .input("quote_id", sql.Int, quoteId)
    .query("SELECT * FROM dbo.quote_items WHERE quote_id = @quote_id");

  const q = qr[0];
  return create(companyId, {
    customerId:    q.customer_id,
    quoteId:       quoteId,
    orderId:       null,
    discount:      Number(q.discount   ?? 0),
    freightValue:  Number(q.freight_value ?? 0),  // ← novo
    paymentTerms:  q.payment_terms  ?? null,
    paymentMethod: q.payment_method ?? null,
    notes:         q.notes          ?? null,
    // internalNotes não herdado intencionalmente
    items: ir.map((i: any) => ({
      productId:   i.product_id  ?? null,
      description: i.description,
      quantity:    Number(i.quantity),
      unitPrice:   Number(i.unit_price),
      unit:        i.unit ?? "UN",   // ← novo
    })),
  });
}

// ── createFromOrder ──────────────────────────────────────────
export async function createFromOrder(companyId: number, orderId: number) {
  const pool = await getPool();

  const { recordset: or } = await pool.request()
    .input("company_id", sql.Int, companyId)
    .input("id",         sql.Int, orderId)
    .query(`SELECT * FROM dbo.orders
            WHERE company_id = @company_id AND id = @id AND status = 'confirmed'`);
  if (!or[0]) return err<SaleServiceError>("ORDER_NOT_FOUND_OR_NOT_CONFIRMED");

  const { recordset: ir } = await pool.request()
    .input("order_id", sql.Int, orderId)
    .query("SELECT * FROM dbo.order_items WHERE order_id = @order_id");

  const o = or[0];
  return create(companyId, {
    customerId:    o.customer_id,
    quoteId:       o.quote_id      ?? null,
    orderId:       orderId,
    sellerId:      o.seller_id     ?? null,
    discount:      Number(o.discount    ?? 0),
    freightValue:  Number(o.freight_value ?? 0),  // ← novo
    paymentTerms:  o.payment_terms  ?? null,
    paymentMethod: o.payment_method ?? null,
    notes:         o.notes          ?? null,
    // internalNotes não herdado intencionalmente
    items: ir.map((i: any) => ({
      productId:   i.product_id  ?? null,
      description: i.description,
      quantity:    Number(i.quantity),
      unitPrice:   Number(i.unit_price),
      unit:        i.unit ?? "UN",   // ← novo
    })),
  });
}
