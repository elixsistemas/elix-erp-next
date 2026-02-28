import sql from "mssql";
import { getPool } from "../../config/db";
import type { SaleCreate, SaleListQuery, SaleUpdate } from "./sales.schema";
import { runFiscalEngineV01 } from "../fiscal/engine/fiscal-engine.service";
import {
  getCompanyUF,
  getCustomerDestUF,
  getActiveCompanyTaxProfile,
  upsertFiscalCalculation,
} from "../fiscal/engine/fiscal-engine.repository";

export type SaleItemFiscalRow = {
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

export async function getSaleItemsForFiscalTx(
  tx: sql.Transaction,
  companyId: number,
  saleId: number
): Promise<SaleItemFiscalRow[]> {
  const { recordset } = await new sql.Request(tx)
    .input("company_id", sql.Int, companyId)
    .input("sale_id", sql.Int, saleId)
    .query(`
      SELECT
        si.id,
        si.product_id,
        si.description,
        si.quantity,
        si.unit_price,
        si.total,
        p.ncm_id,
        p.cest,
        p.fiscal_json
      FROM dbo.sale_items si
      JOIN dbo.sales s
        ON s.id = si.sale_id
       AND s.company_id = @company_id
      LEFT JOIN dbo.products p
        ON p.id = si.product_id
       AND p.company_id = s.company_id
      WHERE si.sale_id = @sale_id
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

const toCents   = (v: number) => Math.round(v * 10000);
const fromCents = (v: number) => v / 10000;

function calcTotals(
  items:       SaleCreate["items"],
  discountRaw: number,
  freightRaw:  number = 0   // ← novo
) {
  const subtotalCents = items.reduce((acc, it) => {
    return acc + Math.round(toCents(it.quantity) * toCents(it.unitPrice) / 10000);
  }, 0);
  const discountCents = toCents(discountRaw);
  const freightCents  = toCents(freightRaw);                               // ← novo
  const totalCents    = Math.max(0, subtotalCents - discountCents + freightCents);
  return {
    subtotal: fromCents(subtotalCents),
    discount: fromCents(discountCents),
    freight:  fromCents(freightCents),                                     // ← novo
    total:    fromCents(totalCents),
  };
}

// ── tipos ────────────────────────────────────────────────────
export type SaleRow = {
  id: number; companyId: number; customerId: number;
  quoteId: number | null; orderId: number | null; sellerId: number | null;
  status: string;
  subtotal: number; discount: number; total: number;
  freightValue:  number;          // ← novo
  internalNotes: string | null;   // ← novo
  sellerName: string | null; paymentTerms: string | null; paymentMethod: string | null;
  notes: string | null;
  createdAt: Date; updatedAt: Date | null;
  completedAt: Date | null; cancelledAt: Date | null;
  customerName?: string;
};

export type SaleItemRow = {
  id: number; saleId: number; productId: number | null;
  description: string; quantity: number; unitPrice: number; total: number;
  unit: string | null;   // ← novo
};

function mapSale(r: any): SaleRow {
  return {
    id: r.id, companyId: r.company_id, customerId: r.customer_id,
    quoteId: r.quote_id, orderId: r.order_id, sellerId: r.seller_id,
    status: r.status,
    subtotal: Number(r.subtotal), discount: Number(r.discount), total: Number(r.total),
    freightValue:  Number(r.freight_value  ?? 0),   // ← novo
    internalNotes: r.internal_notes ?? null,         // ← novo
    sellerName: r.seller_name,
    paymentTerms: r.payment_terms, paymentMethod: r.payment_method,
    notes: r.notes,
    createdAt: r.created_at, updatedAt: r.updated_at,
    completedAt: r.completed_at, cancelledAt: r.cancelled_at,
    customerName: r.customer_name,
  };
}

function mapItem(r: any): SaleItemRow {
  return {
    id: r.id, saleId: r.sale_id, productId: r.product_id,
    description: r.description,
    quantity: Number(r.quantity), unitPrice: Number(r.unit_price), total: Number(r.total),
    unit: r.unit ?? null,   // ← novo
  };
}

// ── listSales ────────────────────────────────────────────────
export async function listSales(companyId: number, q: SaleListQuery) {
  const pool = await getPool();
  const req  = pool.request().input("company_id", sql.Int, companyId);
  const where: string[] = ["s.company_id = @company_id", "s.cancelled_at IS NULL"];

  if (q.q) {
    req.input("q", sql.NVarChar, `%${q.q}%`);
    where.push("(c.name LIKE @q OR CAST(s.id AS VARCHAR) = @q OR s.seller_name LIKE @q)");
  }
  if (q.status)     { req.input("status", sql.VarChar, q.status);    where.push("s.status = @status"); }
  if (q.customerId) { req.input("cid",    sql.Int,     q.customerId); where.push("s.customer_id = @cid"); }
  if (q.from)       { req.input("from",   sql.Date,    q.from);       where.push("s.created_at >= @from"); }
  if (q.to)         { req.input("to",     sql.Date,    q.to);         where.push("s.created_at <= DATEADD(day,1,@to)"); }

  req.input("limit", sql.Int, q.limit ?? 100);

  const { recordset } = await req.query(`
    SELECT TOP (@limit)
      s.*, c.name AS customer_name
    FROM dbo.sales s
    JOIN dbo.customers c ON c.id = s.customer_id AND c.company_id = s.company_id
    WHERE ${where.join(" AND ")}
    ORDER BY s.created_at DESC
  `);
  return recordset.map(mapSale);
}

// ── getSale ──────────────────────────────────────────────────
export async function getSale(companyId: number, id: number) {
  const pool = await getPool();
  const { recordset } = await pool.request()
    .input("company_id", sql.Int, companyId)
    .input("id",         sql.Int, id)
    .query(`
      SELECT s.*, c.name AS customer_name
      FROM dbo.sales s
      JOIN dbo.customers c ON c.id = s.customer_id AND c.company_id = s.company_id
      WHERE s.company_id = @company_id AND s.id = @id
    `);
  return recordset[0] ? mapSale(recordset[0]) : null;
}

// ── getSaleItems ─────────────────────────────────────────────
export async function getSaleItems(companyId: number, saleId: number) {
  const pool = await getPool();
  const { recordset } = await pool.request()
    .input("company_id", sql.Int, companyId)
    .input("sale_id",    sql.Int, saleId)
    .query(`
      SELECT si.*
      FROM dbo.sale_items si
      JOIN dbo.sales s ON s.id = si.sale_id
      WHERE s.company_id = @company_id AND si.sale_id = @sale_id
    `);
  return recordset.map(mapItem);
}

// ── ensureCustomerBelongs ────────────────────────────────────
export async function ensureCustomerBelongs(companyId: number, customerId: number) {
  const pool = await getPool();
  const { recordset } = await pool.request()
    .input("company_id",  sql.Int, companyId)
    .input("customer_id", sql.Int, customerId)
    .query(`SELECT id FROM dbo.customers
            WHERE company_id = @company_id AND id = @customer_id AND deleted_at IS NULL`);
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
  const { recordset } = await req.query(`
    SELECT COUNT(*) AS cnt FROM dbo.products
    WHERE company_id = @company_id AND id IN (${placeholders.join(",")}) AND deleted_at IS NULL
  `);
  return Number(recordset[0].cnt) === productIds.length;
}

// ── resolveSellerName ────────────────────────────────────────
export async function resolveSellerName(companyId: number, sellerId: number) {
  const pool = await getPool();
  const { recordset } = await pool.request()
    .input("company_id", sql.Int, companyId)
    .input("id",         sql.Int, sellerId)
    .query(`
      SELECT TOP 1 u.name
      FROM dbo.users u
      JOIN dbo.user_companies uc
        ON uc.user_id = u.id
       AND uc.company_id = @company_id
       AND uc.active = 1
      WHERE u.id = @id
        AND u.active = 1
    `);

  return (recordset[0]?.name as string) ?? null;
}

// ── createSaleTx ─────────────────────────────────────────────
export async function createSaleTx(
  companyId:     number,
  customerId:    number,
  quoteId:       number | null,
  orderId:       number | null,
  sellerId:      number | null,
  sellerName:    string | null,
  args:          Omit<SaleCreate, "customerId"|"quoteId"|"orderId"|"sellerId"|"items">,
  items:         SaleCreate["items"]
) {
  const { subtotal, discount, freight, total } =
    calcTotals(items, args.discount ?? 0, args.freightValue ?? 0);  // ← freight

  const pool = await getPool();
  const tx   = new sql.Transaction(pool);
  await tx.begin();

  try {
    const header = await new sql.Request(tx)
      .input("company_id",     sql.Int,           companyId)
      .input("customer_id",    sql.Int,           customerId)
      .input("quote_id",       sql.Int,           quoteId)
      .input("order_id",       sql.Int,           orderId)
      .input("seller_id",      sql.Int,           sellerId)
      .input("seller_name",    sql.NVarChar,      sellerName)
      .input("subtotal",       sql.Decimal(15,4), subtotal)
      .input("discount",       sql.Decimal(15,4), discount)
      .input("freight_value",  sql.Decimal(15,4), freight)               // ← novo
      .input("total",          sql.Decimal(15,4), total)
      .input("payment_terms",  sql.NVarChar,      args.paymentTerms  ?? null)
      .input("payment_method", sql.NVarChar,      args.paymentMethod ?? null)
      .input("notes",          sql.NVarChar,      args.notes         ?? null)
      .input("internal_notes", sql.NVarChar(sql.MAX), args.internalNotes ?? null) // ← novo
      .query(`
        INSERT INTO dbo.sales (
          company_id, customer_id, quote_id, order_id,
          seller_id, seller_name,
          subtotal, discount, freight_value, total,
          payment_terms, payment_method,
          notes, internal_notes
        )
        OUTPUT INSERTED.id
        VALUES (
          @company_id, @customer_id, @quote_id, @order_id,
          @seller_id, @seller_name,
          @subtotal, @discount, @freight_value, @total,
          @payment_terms, @payment_method,
          @notes, @internal_notes
        )
      `);

    const saleId = header.recordset[0].id as number;

    for (const item of items) {
      const lineTotal = fromCents(
        Math.round(toCents(item.quantity) * toCents(item.unitPrice) / 10000)
      );
      await new sql.Request(tx)
        .input("sale_id",    sql.Int,           saleId)
        .input("product_id", sql.Int,           item.productId ?? null)
        .input("description",sql.NVarChar,      item.description)
        .input("quantity",   sql.Decimal(15,4), item.quantity)
        .input("unit_price", sql.Decimal(15,4), item.unitPrice)
        .input("total",      sql.Decimal(15,4), lineTotal)
        .input("unit",       sql.NVarChar(10),  item.unit ?? "UN")  // ← novo
        .query(`
          INSERT INTO dbo.sale_items
            (sale_id, product_id, description, quantity, unit_price, total, unit)
          VALUES
            (@sale_id, @product_id, @description, @quantity, @unit_price, @total, @unit)
        `);
    }

    await tx.commit();
    return saleId;
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

// ── replaceSaleItemsTx ───────────────────────────────────────
export async function replaceSaleItemsTx(
  tx:        sql.Transaction,
  companyId: number,
  saleId:    number,
  items:     SaleCreate["items"]
) {
  await new sql.Request(tx)
    .input("sale_id",    sql.Int, saleId)
    .input("company_id", sql.Int, companyId)
    .query(`
      DELETE si FROM dbo.sale_items si
      JOIN dbo.sales s ON s.id = si.sale_id
      WHERE si.sale_id = @sale_id AND s.company_id = @company_id
    `);

  for (const item of items) {
    const lineTotal = fromCents(
      Math.round(toCents(item.quantity) * toCents(item.unitPrice) / 10000)
    );
    await new sql.Request(tx)
      .input("sale_id",    sql.Int,           saleId)
      .input("product_id", sql.Int,           item.productId ?? null)
      .input("description",sql.NVarChar,      item.description)
      .input("quantity",   sql.Decimal(15,4), item.quantity)
      .input("unit_price", sql.Decimal(15,4), item.unitPrice)
      .input("total",      sql.Decimal(15,4), lineTotal)
      .input("unit",       sql.NVarChar(10),  item.unit ?? "UN")  // ← novo
      .query(`
        INSERT INTO dbo.sale_items
          (sale_id, product_id, description, quantity, unit_price, total, unit)
        VALUES
          (@sale_id, @product_id, @description, @quantity, @unit_price, @total, @unit)
      `);
  }
}

// ── updateSaleV2 ─────────────────────────────────────────────
export async function updateSaleV2(
  companyId:  number,
  saleId:     number,
  sellerId:   number | null,
  sellerName: string | null,
  patch:      Omit<SaleUpdate, "items" | "sellerId">,
  items?:     SaleCreate["items"]
) {
  const pool = await getPool();
  const tx   = new sql.Transaction(pool);
  await tx.begin();

  try {
    let finalItems = items;
    if (!finalItems) {
      const existing = await getSaleItems(companyId, saleId);
      finalItems = existing.map(i => ({
        productId:   i.productId ?? undefined,
        description: i.description,
        quantity:    i.quantity,
        unitPrice:   i.unitPrice,
        unit:        i.unit ?? undefined,
      }));
    }

    const { subtotal, discount, freight, total } =
      calcTotals(finalItems, patch.discount ?? 0, patch.freightValue ?? 0);  // ← freight

    const req = new sql.Request(tx)
      .input("company_id",     sql.Int,           companyId)
      .input("sale_id",        sql.Int,           saleId)
      .input("seller_id",      sql.Int,           sellerId)
      .input("seller_name",    sql.NVarChar,      sellerName)
      .input("subtotal",       sql.Decimal(15,4), subtotal)
      .input("discount",       sql.Decimal(15,4), discount)
      .input("freight_value",  sql.Decimal(15,4), freight)               // ← novo
      .input("total",          sql.Decimal(15,4), total)
      .input("payment_terms",  sql.NVarChar,      patch.paymentTerms  ?? null)
      .input("payment_method", sql.NVarChar,      patch.paymentMethod ?? null)
      .input("notes",          sql.NVarChar,      patch.notes         ?? null)
      .input("internal_notes", sql.NVarChar(sql.MAX), patch.internalNotes ?? null); // ← novo

    let customerSet = "";
    if (patch.customerId) {
      req.input("customer_id", sql.Int, patch.customerId);
      customerSet = "customer_id = @customer_id,";
    }

    await req.query(`
      UPDATE dbo.sales SET
        ${customerSet}
        seller_id      = @seller_id,
        seller_name    = @seller_name,
        subtotal       = @subtotal,
        discount       = @discount,
        freight_value  = @freight_value,
        total          = @total,
        payment_terms  = @payment_terms,
        payment_method = @payment_method,
        notes          = @notes,
        internal_notes = @internal_notes,
        updated_at     = SYSUTCDATETIME()
      WHERE company_id = @company_id AND id = @sale_id
    `);

    if (items) await replaceSaleItemsTx(tx, companyId, saleId, items);

    await tx.commit();
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

// ── setSaleStatus ────────────────────────────────────────────
export async function setSaleStatus(
  companyId: number,
  saleId:    number,
  status:    "completed" | "cancelled"
) {
  const pool  = await getPool();
  const tsCol = status === "completed" ? "completed_at" : "cancelled_at";
  await pool.request()
    .input("company_id", sql.Int,     companyId)
    .input("sale_id",    sql.Int,     saleId)
    .input("status",     sql.VarChar, status)
    .query(`
      UPDATE dbo.sales SET
        status     = @status,
        ${tsCol}   = SYSUTCDATETIME(),
        updated_at = SYSUTCDATETIME()
      WHERE company_id = @company_id AND id = @sale_id
    `);
}

export async function completeSaleTx(companyId: number, saleId: number) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();

  try {
    // Pega sale dentro da TX
    const { recordset: sr } = await new sql.Request(tx)
      .input("company_id", sql.Int, companyId)
      .input("sale_id", sql.Int, saleId)
      .query(`
        SELECT TOP 1 *
        FROM dbo.sales
        WHERE company_id = @company_id AND id = @sale_id
      `);

    const s = sr[0];
    if (!s) { await tx.rollback(); return false; }
    if (s.status !== "draft") { await tx.rollback(); return false; }

    // Contexto fiscal
    const originUF = await getCompanyUF(companyId, tx);
    const destUF = await getCustomerDestUF(companyId, Number(s.customer_id), tx);
    const taxProfile = await getActiveCompanyTaxProfile(companyId, tx);

    // Itens com NCM
    const items = await getSaleItemsForFiscalTx(tx, companyId, saleId);

    const ctx = {
      companyId,
      sourceType: "sale" as const,
      sourceId: saleId,
      issuedAt: new Date().toISOString(),
      originUF,
      destUF,
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
      "sale",
      saleId,
      result.engineVersion,
      JSON.stringify(ctx),
      JSON.stringify(result),
      tx
    );

    // Completa a sale na mesma TX
    await new sql.Request(tx)
      .input("company_id", sql.Int, companyId)
      .input("sale_id", sql.Int, saleId)
      .query(`
        UPDATE dbo.sales SET
          status = 'completed',
          completed_at = SYSUTCDATETIME(),
          updated_at = SYSUTCDATETIME()
        WHERE company_id = @company_id AND id = @sale_id
      `);

    await tx.commit();
    return true;
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}