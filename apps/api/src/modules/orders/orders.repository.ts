import { getPool } from "../../config/db";
import sql from "mssql";

export type OrderRow = {
  id: number;
  company_id: number;
  customer_id: number;

  quote_id: number | null; // ✅ novo

  status: string;
  subtotal: number;
  discount: number;
  total: number;
  notes: string | null;
  created_at: string;
  billed_at: string | null;
};

export type OrderItemRow = {
  id: number;
  order_id: number;
  product_id: number;
  kind: "product" | "service";
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
};

export async function listOrders(args: {
  companyId: number;
  from?: string;
  to?: string;
  customerId?: number;
  status?: string;
}) {
  const pool = await getPool();
  const req = pool.request().input("company_id", args.companyId);

  let where = "WHERE company_id=@company_id";

  if (args.customerId) {
    req.input("customer_id", args.customerId);
    where += " AND customer_id=@customer_id";
  }

  if (args.status) {
    req.input("status", args.status);
    where += " AND status=@status";
  }

  if (args.from) {
    req.input("from", args.from);
    where += " AND created_at >= CAST(@from AS date)";
  }

  if (args.to) {
    req.input("to", args.to);
    where += " AND created_at < DATEADD(day, 1, CAST(@to AS date))";
  }

  const r = await req.query(`
    SELECT
      id, company_id, customer_id, quote_id,
      status, subtotal, discount, total, notes, created_at, billed_at
    FROM dbo.orders
    ${where}
    ORDER BY created_at DESC, id DESC
  `);

  return r.recordset as OrderRow[];
}

export async function getOrderWithItems(companyId: number, orderId: number) {
  const pool = await getPool();

  const o = await pool
    .request()
    .input("company_id", companyId)
    .input("order_id", orderId)
    .query(`
      SELECT
        id, company_id, customer_id, quote_id,
        status, subtotal, discount, total, notes, created_at, billed_at
      FROM dbo.orders
      WHERE company_id=@company_id AND id=@order_id
    `);

  const order = (o.recordset[0] as OrderRow) ?? null;
  if (!order) return null;

  const items = await pool
    .request()
    .input("order_id", orderId)
    .query(`
      SELECT id, order_id, product_id, kind, description, quantity, unit_price, total
      FROM dbo.order_items
      WHERE order_id=@order_id
      ORDER BY id
    `);

  return { order, items: items.recordset as OrderItemRow[] };
}

export async function createOrderTx(args: {
  companyId: number;
  quoteId?: number | null;
  customerId: number;
  status?: string;
  subtotal: number;
  discount: number;
  total: number;
  notes?: string | null;
  items: Array<{
    productId: number;
    kind: "product" | "service";
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();

  try {
    const orderRes = await new sql.Request(tx)
      .input("company_id", args.companyId)
      .input("customer_id", args.customerId)
      .input("status", args.status ?? "draft")
      .input("subtotal", args.subtotal)
      .input("discount", args.discount)
      .input("total", args.total)
      .input("notes", args.notes ?? null)
      .input("quote_id", sql.Int, args.quoteId ?? null)
      .query(`
        INSERT INTO dbo.orders (
          company_id, customer_id, status,
          subtotal, discount, total, notes,
          created_at, quote_id
        )
        OUTPUT INSERTED.*
        VALUES (
          @company_id, @customer_id, @status,
          @subtotal, @discount, @total, @notes,
          SYSUTCDATETIME(), @quote_id
        );
     `);

    const order = orderRes.recordset[0] as OrderRow;
    const orderId = Number(order.id);

    for (const it of args.items) {
      await new sql.Request(tx)
        .input("order_id", orderId)
        .input("product_id", it.productId)
        .input("kind", it.kind)
        .input("description", it.description)
        .input("quantity", it.quantity)
        .input("unit_price", it.unitPrice)
        .input("total", it.total)
        .query(`
          INSERT INTO dbo.order_items (order_id, product_id, kind, description, quantity, unit_price, total)
          VALUES (@order_id, @product_id, @kind, @description, @quantity, @unit_price, @total)
        `);
    }

    const items = await new sql.Request(tx)
      .input("order_id", orderId)
      .query(`
        SELECT id, order_id, product_id, kind, description, quantity, unit_price, total
        FROM dbo.order_items
        WHERE order_id=@order_id
        ORDER BY id
      `);

    await tx.commit();
    return { order, items: items.recordset as OrderItemRow[] };
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

export async function updateOrder(args: {
  companyId: number;
  orderId: number;
  status?: string;
  notes?: string | null;
}) {
  const pool = await getPool();
  const r = await pool
    .request()
    .input("company_id", args.companyId)
    .input("order_id", args.orderId)
    .input("status", args.status ?? null)
    .input("notes", args.notes ?? null)
    .query(`
      UPDATE dbo.orders
      SET
        status = COALESCE(@status, status),
        notes = COALESCE(@notes, notes)
      OUTPUT INSERTED.*
      WHERE company_id=@company_id AND id=@order_id
    `);

  return (r.recordset[0] as OrderRow) ?? null;
}

export async function cancelOrder(args: { companyId: number; orderId: number }) {
  const pool = await getPool();
  const r = await pool
    .request()
    .input("company_id", args.companyId)
    .input("order_id", args.orderId)
    .query(`
      UPDATE dbo.orders
      SET status='cancelled'
      OUTPUT INSERTED.*
      WHERE company_id=@company_id AND id=@order_id AND status <> 'billed'
    `);

  return (r.recordset[0] as OrderRow) ?? null;
}

/**
 * Fatura (bill) um pedido:
 * - trava a linha do pedido
 * - impede duplicidade via billed_at
 * - cria sale + sale_items
 * - baixa estoque para itens kind=product
 * - marca orders.status=billed e billed_at=SYSUTCDATETIME()
 *
 * ✅ Agora propaga:
 * - sales.order_id = order.id
 * - sales.quote_id = order.quote_id (se existir)
 */
export async function billOrderToSaleTx(args: { companyId: number; orderId: number }) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();

  try {
    const lock = await new sql.Request(tx)
      .input("company_id", args.companyId)
      .input("order_id", args.orderId)
      .query(`
        SELECT
          id, company_id, customer_id, quote_id,
          status, subtotal, discount, total, notes,
          billed_at, created_at
        FROM dbo.orders WITH (UPDLOCK, ROWLOCK)
        WHERE company_id=@company_id AND id=@order_id
      `);

    const order = lock.recordset[0] as OrderRow | undefined;
    if (!order) {
      await tx.rollback();
      return { error: "ORDER_NOT_FOUND" as const };
    }

    if (order.status === "cancelled") {
      await tx.rollback();
      return { error: "ORDER_CANCELLED" as const };
    }

    if (order.billed_at) {
      await tx.rollback();
      return { error: "ORDER_ALREADY_BILLED" as const };
    }

    const itemsRes = await new sql.Request(tx)
      .input("order_id", args.orderId)
      .query(`
        SELECT id, order_id, product_id, kind, description, quantity, unit_price, total
        FROM dbo.order_items
        WHERE order_id=@order_id
        ORDER BY id
      `);

    const items = itemsRes.recordset as OrderItemRow[];
    if (!items.length) {
      await tx.rollback();
      return { error: "ORDER_EMPTY" as const };
    }

    // ✅ Cria sale a partir do pedido (com rastreio)
    const saleRes = await new sql.Request(tx)
      .input("company_id", args.companyId)
      .input("customer_id", order.customer_id)
      .input("quote_id", sql.Int, order.quote_id ?? null)
      .input("order_id", sql.Int, args.orderId)
      .input("subtotal", order.subtotal)
      .input("discount", order.discount)
      .input("total", order.total)
      .input("notes", order.notes ?? null)
      .query(`
        INSERT INTO dbo.sales (
          company_id, customer_id,
          quote_id, order_id,
          status, subtotal, discount, total, notes,
          created_at
        )
        OUTPUT INSERTED.*
        VALUES (
          @company_id, @customer_id,
          @quote_id, @order_id,
          'open', @subtotal, @discount, @total, @notes,
          SYSUTCDATETIME()
        )
      `);

    const sale = saleRes.recordset[0];
    const saleId = Number(sale.id);
    const occurredAt = sale?.created_at ?? null;

    // Insere sale_items e baixa estoque se produto
    for (const it of items) {
      const ins = await new sql.Request(tx)
        .input("sale_id", saleId)
        .input("product_id", it.product_id)
        .input("kind", it.kind) // ✅ propaga kind para fiscal/relatórios
        .input("description", it.description)
        .input("quantity", it.quantity)
        .input("unit_price", it.unit_price)
        .input("total", it.total)
        .query(`
          INSERT INTO dbo.sale_items (sale_id, product_id, kind, description, quantity, unit_price, total)
          OUTPUT INSERTED.id
          VALUES (@sale_id, @product_id, @kind, @description, @quantity, @unit_price, @total)
        `);

      const saleItemId = Number(ins.recordset[0]?.id);

      if (String(it.kind).toLowerCase() === "product") {
        await new sql.Request(tx)
          .input("company_id", args.companyId)
          .input("product_id", it.product_id)
          .input("type", "OUT")
          .input("quantity", it.quantity)
          .input("source", "ORDER_BILL")
          .input("source_id", saleId)
          .input("note", `Auto OUT from billed order #${args.orderId} (sale #${saleId})`)
          // ledger
          .input("source_type", "ORDER")
          .input("reason", "SALE")
          .input("idempotency_key", `ORDER:${args.orderId}:SALE:${saleId}:ITEM:${saleItemId}`)
          .input("occurred_at", occurredAt)
          .execute("dbo.sp_inventory_move");
      }
    }

    // Marca order como billed
    await new sql.Request(tx)
      .input("company_id", args.companyId)
      .input("order_id", args.orderId)
      .query(`
        UPDATE dbo.orders
        SET status='billed', billed_at=SYSUTCDATETIME()
        WHERE company_id=@company_id AND id=@order_id AND billed_at IS NULL
      `);

    const saleItems = await new sql.Request(tx)
      .input("sale_id", saleId)
      .query(`
        SELECT id, sale_id, product_id, kind, description, quantity, unit_price, total
        FROM dbo.sale_items
        WHERE sale_id=@sale_id
        ORDER BY id
      `);

    await tx.commit();
    return { data: { sale, items: saleItems.recordset } };
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

export async function quoteBelongsToCompany(args: { companyId: number; quoteId: number }) {
  const pool = await getPool();
  const r = await pool.request()
    .input("company_id", sql.Int, args.companyId)
    .input("quote_id", sql.Int, args.quoteId)
    .query(`
      SELECT TOP 1 id
      FROM dbo.quotes
      WHERE company_id=@company_id AND id=@quote_id
    `);

  return !!r.recordset[0];
}
