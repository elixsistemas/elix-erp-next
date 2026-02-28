import sql from "mssql";
import { getPool } from "../../config/db";
import type { OrderCreate, OrderListQuery, OrderUpdate } from "./orders.schema";
import { runFiscalEngineV01 } from "../fiscal/engine/fiscal-engine.service";
import {
  getCompanyUF,
  getCustomerDestUF,
  getActiveCompanyTaxProfile,
  upsertFiscalCalculation,
} from "../fiscal/engine/fiscal-engine.repository";

export type OrderItemFiscalRow = {
  id: number;
  productId: number | null;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  ncmId: number | null;
  cest: string | null;
  fiscalJson: string | null;
};

export async function getOrderItemsForFiscalTx(
  tx: sql.Transaction,
  companyId: number,
  orderId: number
): Promise<OrderItemFiscalRow[]> {
  const { recordset } = await new sql.Request(tx)
    .input("company_id", sql.Int, companyId)
    .input("order_id", sql.Int, orderId)
    .query(`
      SELECT
        oi.id,
        oi.product_id,
        oi.description,
        oi.quantity,
        oi.unit_price,
        oi.total,
        p.ncm_id,
        p.cest,
        p.fiscal_json
      FROM dbo.order_items oi
      JOIN dbo.orders o ON o.id = oi.order_id AND o.company_id = @company_id
      LEFT JOIN dbo.products p ON p.id = oi.product_id AND p.company_id = o.company_id
      WHERE oi.order_id = @order_id
    `);

  return recordset.map((r: any) => ({
    id: Number(r.id),
    productId: r.product_id ?? null,
    description: r.description,
    quantity: Number(r.quantity),
    unitPrice: Number(r.unit_price),
    total: Number(r.total),
    ncmId: r.ncm_id ?? null,
    cest: r.cest ?? null,
    fiscalJson: r.fiscal_json ?? null,
  }));
}

// ── helpers de cálculo ───────────────────────────────────────
const toCents   = (v: number) => Math.round(v * 10000);
const fromCents = (v: number) => v / 10000;

function calcTotals(
  items:        OrderCreate["items"],
  discountRaw:  number,
  freightRaw:   number = 0   // ← novo parâmetro
) {
  const subtotalCents = items.reduce((acc, it) => {
    return acc + Math.round(toCents(it.quantity) * toCents(it.unitPrice) / 10000);
  }, 0);
  const discountCents = toCents(discountRaw);
  const freightCents  = toCents(freightRaw);                          // ← novo
  const totalCents    = Math.max(0, subtotalCents - discountCents + freightCents); // ← frete somado
  return {
    subtotal: fromCents(subtotalCents),
    discount: fromCents(discountCents),
    freight:  fromCents(freightCents),                                // ← novo
    total:    fromCents(totalCents),
  };
}

// ── tipos de retorno ─────────────────────────────────────────
export type OrderRow = {
  id: number; companyId: number; customerId: number; quoteId: number | null;
  status: string;
  subtotal: number; discount: number; total: number;
  freightValue:  number;          // ← novo
  internalNotes: string | null;   // ← novo
  sellerName: string | null; paymentTerms: string | null; paymentMethod: string | null;
  transportMode: string | null; expectedDelivery: string | null;
  deliveryZipcode: string | null; deliveryStreet: string | null;
  deliveryNumber: string | null; deliveryComplement: string | null;
  deliveryNeighborhood: string | null; deliveryCity: string | null; deliveryState: string | null;
  notes: string | null;
  createdAt: Date; updatedAt: Date | null;
  confirmedAt: Date | null; cancelledAt: Date | null;
  customerName?: string;
};

export type OrderItemRow = {
  id: number; orderId: number; productId: number | null;
  description: string; quantity: number; unitPrice: number; total: number;
  unit: string | null;   // ← novo
};

function mapOrder(r: any): OrderRow {
  return {
    id: r.id, companyId: r.company_id, customerId: r.customer_id, quoteId: r.quote_id,
    status: r.status,
    subtotal: Number(r.subtotal), discount: Number(r.discount), total: Number(r.total),
    freightValue:  Number(r.freight_value  ?? 0),   // ← novo
    internalNotes: r.internal_notes ?? null,         // ← novo
    sellerName: r.seller_name, paymentTerms: r.payment_terms, paymentMethod: r.payment_method,
    transportMode: r.transport_mode, expectedDelivery: r.expected_delivery,
    deliveryZipcode: r.delivery_zipcode, deliveryStreet: r.delivery_street,
    deliveryNumber: r.delivery_number, deliveryComplement: r.delivery_complement,
    deliveryNeighborhood: r.delivery_neighborhood, deliveryCity: r.delivery_city,
    deliveryState: r.delivery_state, notes: r.notes,
    createdAt: r.created_at, updatedAt: r.updated_at,
    confirmedAt: r.confirmed_at, cancelledAt: r.cancelled_at,
    customerName: r.customer_name,
  };
}

function mapItem(r: any): OrderItemRow {
  return {
    id: r.id, orderId: r.order_id, productId: r.product_id,
    description: r.description,
    quantity: Number(r.quantity), unitPrice: Number(r.unit_price), total: Number(r.total),
    unit: r.unit ?? null,   // ← novo
  };
}

// ── listOrders ───────────────────────────────────────────────
export async function listOrders(companyId: number, q: OrderListQuery) {
  const pool  = await getPool();
  const req   = pool.request().input("company_id", sql.Int, companyId);
  const where: string[] = ["o.company_id = @company_id", "o.cancelled_at IS NULL"];

  if (q.q) {
    req.input("q", sql.NVarChar, `%${q.q}%`);
    where.push("(c.name LIKE @q OR CAST(o.id AS VARCHAR) = @q OR o.seller_name LIKE @q)");
  }
  if (q.status)     { req.input("status", sql.VarChar, q.status);      where.push("o.status = @status"); }
  if (q.customerId) { req.input("cid",    sql.Int,     q.customerId);  where.push("o.customer_id = @cid"); }
  if (q.from)       { req.input("from",   sql.Date,    q.from);        where.push("o.created_at >= @from"); }
  if (q.to)         { req.input("to",     sql.Date,    q.to);          where.push("o.created_at <= DATEADD(day,1,@to)"); }

  req.input("limit", sql.Int, q.limit ?? 100);

  const { recordset } = await req.query(`
    SELECT TOP (@limit)
      o.*, c.name AS customer_name
    FROM dbo.orders o
    JOIN dbo.customers c ON c.id = o.customer_id AND c.company_id = o.company_id
    WHERE ${where.join(" AND ")}
    ORDER BY o.created_at DESC
  `);
  return recordset.map(mapOrder);
}

// ── getOrder ─────────────────────────────────────────────────
export async function getOrder(companyId: number, id: number) {
  const pool = await getPool();
  const { recordset } = await pool.request()
    .input("company_id", sql.Int, companyId)
    .input("id",         sql.Int, id)
    .query(`
      SELECT o.*, c.name AS customer_name
      FROM dbo.orders o
      JOIN dbo.customers c ON c.id = o.customer_id AND c.company_id = o.company_id
      WHERE o.company_id = @company_id AND o.id = @id
    `);
  return recordset[0] ? mapOrder(recordset[0]) : null;
}

// ── getOrderItems ────────────────────────────────────────────
export async function getOrderItems(companyId: number, orderId: number) {
  const pool = await getPool();
  const { recordset } = await pool.request()
    .input("company_id", sql.Int, companyId)
    .input("order_id",   sql.Int, orderId)
    .query(`
      SELECT oi.*
      FROM dbo.order_items oi
      JOIN dbo.orders o ON o.id = oi.order_id
      WHERE o.company_id = @company_id AND oi.order_id = @order_id
    `);
  return recordset.map(mapItem);
}

// ── ensureCustomerBelongs ────────────────────────────────────
export async function ensureCustomerBelongs(companyId: number, customerId: number) {
  const pool = await getPool();
  const { recordset } = await pool.request()
    .input("company_id",  sql.Int, companyId)
    .input("customer_id", sql.Int, customerId)
    .query("SELECT id FROM dbo.customers WHERE company_id=@company_id AND id=@customer_id AND deleted_at IS NULL");
  return recordset.length > 0;
}

// ── ensureProductsBelong ─────────────────────────────────────
export async function ensureProductsBelong(companyId: number, productIds: number[]) {
  if (!productIds.length) return true;
  const pool = await getPool();
  const req  = pool.request().input("company_id", sql.Int, companyId);
  const placeholders = productIds.map((pid, i) => {
    req.input(`pid${i}`, sql.Int, pid);
    return `@pid${i}`;
  });
  const { recordset } = await req.query(
    `SELECT COUNT(*) AS cnt FROM dbo.products
     WHERE company_id=@company_id AND id IN (${placeholders.join(",")}) AND deleted_at IS NULL`
  );
  return Number(recordset[0].cnt) === productIds.length;
}

// ── createOrderTx ────────────────────────────────────────────
export async function createOrderTx(
  companyId:  number,
  customerId: number,
  quoteId:    number | null,
  args:       Omit<OrderCreate, "customerId" | "quoteId" | "items">,
  items:      OrderCreate["items"]
) {
  const { subtotal, discount, freight, total } =
    calcTotals(items, args.discount ?? 0, args.freightValue ?? 0); // ← freight passado

  const pool = await getPool();
  const tx   = new sql.Transaction(pool);
  await tx.begin();

  try {
    const header = await new sql.Request(tx)
      .input("company_id",            sql.Int,           companyId)
      .input("customer_id",           sql.Int,           customerId)
      .input("quote_id",              sql.Int,           quoteId ?? null)
      .input("subtotal",              sql.Decimal(15,4), subtotal)
      .input("discount",              sql.Decimal(15,4), discount)
      .input("freight_value",         sql.Decimal(15,4), freight)              // ← novo
      .input("total",                 sql.Decimal(15,4), total)
      .input("internal_notes",        sql.NVarChar(sql.MAX), args.internalNotes ?? null) // ← novo
      .input("seller_name",           sql.NVarChar,      args.sellerName          ?? null)
      .input("payment_terms",         sql.NVarChar,      args.paymentTerms        ?? null)
      .input("payment_method",        sql.NVarChar,      args.paymentMethod       ?? null)
      .input("transport_mode",        sql.NVarChar,      args.transportMode       ?? null)
      .input("expected_delivery",     sql.Date,          args.expectedDelivery    ?? null)
      .input("delivery_zipcode",      sql.VarChar,       args.deliveryZipcode     ?? null)
      .input("delivery_street",       sql.NVarChar,      args.deliveryStreet      ?? null)
      .input("delivery_number",       sql.NVarChar,      args.deliveryNumber      ?? null)
      .input("delivery_complement",   sql.NVarChar,      args.deliveryComplement  ?? null)
      .input("delivery_neighborhood", sql.NVarChar,      args.deliveryNeighborhood ?? null)
      .input("delivery_city",         sql.NVarChar,      args.deliveryCity        ?? null)
      .input("delivery_state",        sql.Char(2),       args.deliveryState       ?? null)
      .input("notes",                 sql.NVarChar,      args.notes               ?? null)
      .query(`
        INSERT INTO dbo.orders (
          company_id, customer_id, quote_id,
          subtotal, discount, freight_value, total,
          internal_notes,
          seller_name, payment_terms, payment_method, transport_mode, expected_delivery,
          delivery_zipcode, delivery_street, delivery_number, delivery_complement,
          delivery_neighborhood, delivery_city, delivery_state, notes
        )
        OUTPUT INSERTED.id
        VALUES (
          @company_id, @customer_id, @quote_id,
          @subtotal, @discount, @freight_value, @total,
          @internal_notes,
          @seller_name, @payment_terms, @payment_method, @transport_mode, @expected_delivery,
          @delivery_zipcode, @delivery_street, @delivery_number, @delivery_complement,
          @delivery_neighborhood, @delivery_city, @delivery_state, @notes
        )
      `);

    const orderId = header.recordset[0].id as number;

    for (const item of items) {
      const lineTotal = fromCents(
        Math.round(toCents(item.quantity) * toCents(item.unitPrice) / 10000)
      );
      await new sql.Request(tx)
        .input("order_id",   sql.Int,           orderId)
        .input("product_id", sql.Int,           item.productId ?? null)
        .input("description",sql.NVarChar,      item.description)
        .input("quantity",   sql.Decimal(15,4), item.quantity)
        .input("unit_price", sql.Decimal(15,4), item.unitPrice)
        .input("total",      sql.Decimal(15,4), lineTotal)
        .input("unit",       sql.NVarChar(10),  item.unit ?? "UN")  // ← novo
        .query(`
          INSERT INTO dbo.order_items
            (order_id, product_id, description, quantity, unit_price, total, unit)
          VALUES
            (@order_id, @product_id, @description, @quantity, @unit_price, @total, @unit)
        `);
    }

    await tx.commit();
    return orderId;

  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

// ── replaceOrderItemsTx ──────────────────────────────────────
export async function replaceOrderItemsTx(
  tx:        sql.Transaction,
  companyId: number,
  orderId:   number,
  items:     OrderCreate["items"]
) {
  await new sql.Request(tx)
    .input("order_id",   sql.Int, orderId)
    .input("company_id", sql.Int, companyId)
    .query(`
      DELETE oi FROM dbo.order_items oi
      JOIN dbo.orders o ON o.id = oi.order_id
      WHERE oi.order_id = @order_id AND o.company_id = @company_id
    `);

  for (const item of items) {
    const lineTotal = fromCents(
      Math.round(toCents(item.quantity) * toCents(item.unitPrice) / 10000)
    );
    await new sql.Request(tx)
      .input("order_id",   sql.Int,           orderId)
      .input("product_id", sql.Int,           item.productId ?? null)
      .input("description",sql.NVarChar,      item.description)
      .input("quantity",   sql.Decimal(15,4), item.quantity)
      .input("unit_price", sql.Decimal(15,4), item.unitPrice)
      .input("total",      sql.Decimal(15,4), lineTotal)
      .input("unit",       sql.NVarChar(10),  item.unit ?? "UN")  // ← novo
      .query(`
        INSERT INTO dbo.order_items
          (order_id, product_id, description, quantity, unit_price, total, unit)
        VALUES
          (@order_id, @product_id, @description, @quantity, @unit_price, @total, @unit)
      `);
  }
}

// ── updateOrderV2 ────────────────────────────────────────────
export async function updateOrderV2(
  companyId: number,
  orderId:   number,
  patch:     Omit<OrderUpdate, "items">,
  items?:    OrderCreate["items"]
) {
  const pool = await getPool();
  const tx   = new sql.Transaction(pool);
  await tx.begin();

  try {
    let finalItems = items;
    if (!finalItems) {
      const existing = await getOrderItems(companyId, orderId);
      finalItems = existing.map(i => ({
        productId:   i.productId ?? undefined,
        description: i.description,
        quantity:    i.quantity,
        unitPrice:   i.unitPrice,
        unit:        i.unit ?? undefined,
      }));
    }

    const { subtotal, discount, freight, total } =
      calcTotals(finalItems, patch.discount ?? 0, patch.freightValue ?? 0); // ← freight

    const req = new sql.Request(tx)
      .input("company_id",            sql.Int,           companyId)
      .input("order_id",              sql.Int,           orderId)
      .input("subtotal",              sql.Decimal(15,4), subtotal)
      .input("discount",              sql.Decimal(15,4), discount)
      .input("freight_value",         sql.Decimal(15,4), freight)              // ← novo
      .input("total",                 sql.Decimal(15,4), total)
      .input("internal_notes",        sql.NVarChar(sql.MAX), patch.internalNotes ?? null) // ← novo
      .input("seller_name",           sql.NVarChar,      patch.sellerName          ?? null)
      .input("payment_terms",         sql.NVarChar,      patch.paymentTerms        ?? null)
      .input("payment_method",        sql.NVarChar,      patch.paymentMethod       ?? null)
      .input("transport_mode",        sql.NVarChar,      patch.transportMode       ?? null)
      .input("expected_delivery",     sql.Date,          patch.expectedDelivery    ?? null)
      .input("delivery_zipcode",      sql.VarChar,       patch.deliveryZipcode     ?? null)
      .input("delivery_street",       sql.NVarChar,      patch.deliveryStreet      ?? null)
      .input("delivery_number",       sql.NVarChar,      patch.deliveryNumber      ?? null)
      .input("delivery_complement",   sql.NVarChar,      patch.deliveryComplement  ?? null)
      .input("delivery_neighborhood", sql.NVarChar,      patch.deliveryNeighborhood ?? null)
      .input("delivery_city",         sql.NVarChar,      patch.deliveryCity        ?? null)
      .input("delivery_state",        sql.Char(2),       patch.deliveryState       ?? null)
      .input("notes",                 sql.NVarChar,      patch.notes               ?? null);

    let customerSet = "";
    if (patch.customerId) {
      req.input("customer_id", sql.Int, patch.customerId);
      customerSet = "customer_id = @customer_id,";
    }

    await req.query(`
      UPDATE dbo.orders SET
        ${customerSet}
        subtotal = @subtotal, discount = @discount,
        freight_value = @freight_value,
        total = @total,
        internal_notes = @internal_notes,
        seller_name = @seller_name, payment_terms = @payment_terms,
        payment_method = @payment_method, transport_mode = @transport_mode,
        expected_delivery = @expected_delivery,
        delivery_zipcode = @delivery_zipcode, delivery_street = @delivery_street,
        delivery_number = @delivery_number, delivery_complement = @delivery_complement,
        delivery_neighborhood = @delivery_neighborhood, delivery_city = @delivery_city,
        delivery_state = @delivery_state,
        notes = @notes,
        updated_at = SYSUTCDATETIME()
      WHERE company_id = @company_id AND id = @order_id
    `);

    if (items) await replaceOrderItemsTx(tx, companyId, orderId, items);

    await tx.commit();

  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

// ── setOrderStatus ───────────────────────────────────────────
export async function setOrderStatus(
  companyId: number,
  orderId:   number,
  status:    "confirmed" | "cancelled"
) {
  const pool  = await getPool();
  const tsCol = status === "confirmed" ? "confirmed_at" : "cancelled_at";
  await pool.request()
    .input("company_id", sql.Int,     companyId)
    .input("order_id",   sql.Int,     orderId)
    .input("status",     sql.VarChar, status)
    .query(`
      UPDATE dbo.orders SET
        status = @status,
        ${tsCol} = SYSUTCDATETIME(),
        updated_at = SYSUTCDATETIME()
      WHERE company_id = @company_id AND id = @order_id
    `);
}

// Confirma pedido + salva snapshot fiscal na mesma TX (rollback garantido)
export async function confirmOrderTx(companyId: number, orderId: number) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();

  try {
    // lock lógico: pega o pedido dentro da tx
    const { recordset: or } = await new sql.Request(tx)
      .input("company_id", sql.Int, companyId)
      .input("order_id", sql.Int, orderId)
      .query(`
        SELECT TOP 1 *
        FROM dbo.orders
        WHERE company_id = @company_id AND id = @order_id
      `);

    const o = or[0];
    if (!o) { await tx.rollback(); return false; }
    if (o.status !== "draft") { await tx.rollback(); return false; }

    const originUF = await getCompanyUF(companyId, tx);
    const destUF =
      (o.delivery_state && String(o.delivery_state).trim()) ||
      (await getCustomerDestUF(companyId, Number(o.customer_id), tx));

    const taxProfile = await getActiveCompanyTaxProfile(companyId, tx);

    const items = await getOrderItemsForFiscalTx(tx, companyId, orderId);

    const ctx = {
      companyId,
      sourceType: "order" as const,
      sourceId: orderId,
      issuedAt: new Date().toISOString(),
      originUF,
      destUF: destUF ?? null,
      crt: taxProfile?.crt ?? null,
      icmsContributor: taxProfile?.icmsContributor ?? null,
    };

    const engineItems = items.map((it) => ({
      lineId: it.id,
      productId: it.productId,
      description: it.description,
      ncmId: it.ncmId,
      cest: it.cest,
      qty: it.quantity,
      unitPrice: it.unitPrice,
      total: it.total,
    }));

    const result = runFiscalEngineV01(ctx, engineItems);

    await upsertFiscalCalculation(
      companyId,
      "order",
      orderId,
      result.engineVersion,
      JSON.stringify(ctx),
      JSON.stringify(result),
      tx
    );

    // agora confirma (mesma TX)
    await new sql.Request(tx)
      .input("company_id", sql.Int, companyId)
      .input("order_id", sql.Int, orderId)
      .query(`
        UPDATE dbo.orders SET
          status = 'confirmed',
          confirmed_at = SYSUTCDATETIME(),
          updated_at = SYSUTCDATETIME()
        WHERE company_id = @company_id AND id = @order_id
      `);

    await tx.commit();
    return true;
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}