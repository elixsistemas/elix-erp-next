import * as repo from "./orders.repository";
import type { OrderCreate, OrderListQuery, OrderUpdate } from "./orders.schema";

type Ok<T>  = { data: T };
type Err<E> = { error: E };
type OrderServiceError =
  | "CUSTOMER_NOT_FOUND"
  | "PRODUCT_NOT_FOUND"
  | "ORDER_NOT_FOUND"
  | "ORDER_LOCKED"
  | "INVALID_STATUS";

function ok<T>(data: T): Ok<T>      { return { data }; }
function err<E>(e: E): Err<E>       { return { error: e }; }
function hasError<T>(x: Ok<T> | Err<any>): x is Err<any> { return "error" in x; }

// ── list ─────────────────────────────────────────────────────
export async function list(companyId: number, query: OrderListQuery) {
  const rows = await repo.listOrders(companyId, query);
  return ok(rows);
}

// ── get ──────────────────────────────────────────────────────
export async function get(companyId: number, id: number) {
  const order = await repo.getOrder(companyId, id);
  if (!order) return err<OrderServiceError>("ORDER_NOT_FOUND");
  const items = await repo.getOrderItems(companyId, id);
  return ok({ order, items });
}

// ── create ───────────────────────────────────────────────────
export async function create(companyId: number, args: OrderCreate) {
  const ok1 = await repo.ensureCustomerBelongs(companyId, args.customerId);
  if (!ok1) return err<OrderServiceError>("CUSTOMER_NOT_FOUND");

  const productIds = args.items.map(i => i.productId).filter((id): id is number => !!id);
  if (productIds.length) {
    const ok2 = await repo.ensureProductsBelong(companyId, productIds);
    if (!ok2) return err<OrderServiceError>("PRODUCT_NOT_FOUND");
  }

  const orderId = await repo.createOrderTx(
    companyId,
    args.customerId,
    args.quoteId ?? null,
    {
      discount:             args.discount,
      freightValue:         args.freightValue,        // ← novo
      notes:                args.notes,
      internalNotes:        args.internalNotes,       // ← novo
      expectedDelivery:     args.expectedDelivery,
      paymentTerms:         args.paymentTerms,
      paymentMethod:        args.paymentMethod,
      sellerName:           args.sellerName,
      transportMode:        args.transportMode,
      deliveryZipcode:      args.deliveryZipcode,
      deliveryStreet:       args.deliveryStreet,
      deliveryNumber:       args.deliveryNumber,
      deliveryComplement:   args.deliveryComplement,
      deliveryNeighborhood: args.deliveryNeighborhood,
      deliveryCity:         args.deliveryCity,
      deliveryState:        args.deliveryState,
    },
    args.items
  );

  const result = await repo.getOrder(companyId, orderId);
  const items  = await repo.getOrderItems(companyId, orderId);
  return ok({ order: result!, items });
}

// ── update ───────────────────────────────────────────────────
export async function update(companyId: number, id: number, args: OrderUpdate) {
  const order = await repo.getOrder(companyId, id);
  if (!order) return err<OrderServiceError>("ORDER_NOT_FOUND");
  if (order.status !== "draft") return err<OrderServiceError>("ORDER_LOCKED");

  if (args.customerId) {
    const ok1 = await repo.ensureCustomerBelongs(companyId, args.customerId);
    if (!ok1) return err<OrderServiceError>("CUSTOMER_NOT_FOUND");
  }

  if (args.items) {
    const productIds = args.items.map(i => i.productId).filter((id): id is number => !!id);
    if (productIds.length) {
      const ok2 = await repo.ensureProductsBelong(companyId, productIds);
      if (!ok2) return err<OrderServiceError>("PRODUCT_NOT_FOUND");
    }
  }

  await repo.updateOrderV2(companyId, id, args, args.items);

  const updated = await repo.getOrder(companyId, id);
  const items   = await repo.getOrderItems(companyId, id);
  return ok({ order: updated!, items });
}

// ── confirm ──────────────────────────────────────────────────
export async function confirm(companyId: number, id: number) {
  const order = await repo.getOrder(companyId, id);
  if (!order) return err<OrderServiceError>("ORDER_NOT_FOUND");
  if (order.status !== "draft") return err<OrderServiceError>("INVALID_STATUS");
  await repo.setOrderStatus(companyId, id, "confirmed");
  return ok({ id, status: "confirmed" });
}

// ── cancel ───────────────────────────────────────────────────
export async function cancel(companyId: number, id: number) {
  const order = await repo.getOrder(companyId, id);
  if (!order) return err<OrderServiceError>("ORDER_NOT_FOUND");
  if (order.status === "cancelled") return err<OrderServiceError>("INVALID_STATUS");
  await repo.setOrderStatus(companyId, id, "cancelled");
  return ok({ id, status: "cancelled" });
}

export async function createFromQuote(companyId: number, quoteId: number) {
  const { getPool } = await import("../../config/db");
  const sql  = (await import("mssql")).default;
  const pool = await getPool();

  const { recordset: qr } = await pool.request()
    .input("company_id", sql.Int, companyId)
    .input("id",         sql.Int, quoteId)
    .query(`
      SELECT * FROM dbo.quotes
      WHERE company_id = @company_id AND id = @id AND status = 'approved'
    `);

  if (!qr[0]) return { error: "QUOTE_NOT_FOUND_OR_NOT_APPROVED" };

  const { recordset: ir } = await pool.request()
    .input("quote_id", sql.Int, quoteId)
    .query("SELECT * FROM dbo.quote_items WHERE quote_id = @quote_id");

  const q = qr[0];

  const items = ir.map((i: any) => ({
    productId:   i.product_id   ?? null,
    description: i.description,
    quantity:    Number(i.quantity),
    unitPrice:   Number(i.unit_price),
    unit:        i.unit ?? "UN",   // ← novo — herda unidade do orçamento
  }));

  return create(companyId, {
    customerId:    q.customer_id,
    quoteId:       quoteId,
    discount:      Number(q.discount    ?? 0),
    freightValue:  Number(q.freight_value ?? 0),   // ← novo
    notes:         q.notes         ?? null,
    // internalNotes intencionalmente NÃO herdado (obs interna é do orçamento)
    paymentTerms:  q.payment_terms  ?? null,
    paymentMethod: q.payment_method ?? null,
    items,
  });
}
