import sql from "mssql";
import { getPool } from "../../config/db";
import type { QuoteListQuery } from "./quotes.schema";

export type QuoteRow = {
  id: number;
  company_id: number;
  customer_id: number;
  status: "draft" | "approved" | "cancelled";
  subtotal: number;
  discount: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  approved_at: string | null;
  cancelled_at: string | null;
};

export type QuoteListRow = QuoteRow & {
  customer_name: string;
  customer_document: string;
};

export type QuoteItemRow = {
  id: number;
  quote_id: number;
  product_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;

  // extras (não quebram o front; só ajudam UX/print)
  product_name?: string;
  product_sku?: string | null;
  product_kind?: string;
  product_uom?: string | null;
};

export async function ensureCustomerBelongs(companyId: number, customerId: number) {
  const pool = await getPool();
  const rs = await pool.request()
    .input("company_id", sql.Int, companyId)
    .input("customer_id", sql.Int, customerId)
    .query(`
      SELECT TOP 1 id
      FROM dbo.customers
      WHERE company_id=@company_id AND id=@customer_id AND (is_active=1 OR is_active IS NULL);
    `);

  return Boolean(rs.recordset[0]);
}

export async function ensureProductsBelong(companyId: number, productIds: number[]) {
  const ids = Array.from(new Set(productIds)).filter((n) => Number.isFinite(n));
  if (ids.length === 0) return false;

  const pool = await getPool();
  const req = pool.request().input("company_id", sql.Int, companyId);

  const params: string[] = [];
  ids.forEach((id, idx) => {
    const k = `p${idx}`;
    params.push(`@${k}`);
    req.input(k, sql.Int, id);
  });

  const rs = await req.query<{ c: number }>(`
    SELECT COUNT(*) AS c
    FROM dbo.products
    WHERE company_id=@company_id AND id IN (${params.join(",")});
  `);

  return Number(rs.recordset[0]?.c ?? 0) === ids.length;
}

export async function listQuotes(companyId: number, q: QuoteListQuery) {
  const pool = await getPool();
  const limit = Math.min(Number(q.limit ?? 50), 200);

  const where: string[] = ["qt.company_id = @company_id"];
  const req = pool.request()
    .input("company_id", sql.Int, companyId)
    .input("limit", sql.Int, limit);

  if (q.status) {
    where.push("qt.status = @status");
    req.input("status", sql.NVarChar(20), q.status);
  }

  if (typeof q.customerId === "number") {
    where.push("qt.customer_id = @customer_id");
    req.input("customer_id", sql.Int, q.customerId);
  }

  // from/to: usa TRY_CONVERT para não estourar em string inválida
  if (q.from) {
    where.push("qt.created_at >= TRY_CONVERT(datetime2(7), @from)");
    req.input("from", sql.NVarChar(40), q.from);
  }
  if (q.to) {
    // inclusivo (até o fim do dia) se vier yyyy-mm-dd
    where.push("qt.created_at < DATEADD(day, 1, TRY_CONVERT(datetime2(7), @to))");
    req.input("to", sql.NVarChar(40), q.to);
  }

  if (q.q?.trim()) {
    where.push(`(
      CAST(qt.id AS nvarchar(20)) LIKE @q OR
      c.name LIKE @q OR
      c.document LIKE @q OR
      qt.notes LIKE @q
    )`);
    req.input("q", sql.NVarChar(220), `%${q.q.trim()}%`);
  }

  const sqlText = `
    SELECT TOP (@limit)
      qt.id, qt.company_id, qt.customer_id, qt.status, qt.subtotal, qt.discount, qt.total, qt.notes,
      qt.created_at, qt.updated_at, qt.approved_at, qt.cancelled_at,
      c.name AS customer_name,
      c.document AS customer_document
    FROM dbo.quotes qt
    INNER JOIN dbo.customers c
      ON c.id = qt.customer_id AND c.company_id = qt.company_id
    WHERE ${where.join(" AND ")}
    ORDER BY qt.created_at DESC, qt.id DESC;
  `;

  const rs = await req.query<QuoteListRow>(sqlText);
  return rs.recordset;
}

export async function getQuote(companyId: number, id: number) {
  const pool = await getPool();
  const rs = await pool.request()
    .input("company_id", sql.Int, companyId)
    .input("id", sql.Int, id)
    .query<QuoteRow>(`
      SELECT TOP 1
        id, company_id, customer_id, status, subtotal, discount, total, notes,
        created_at, updated_at, approved_at, cancelled_at
      FROM dbo.quotes
      WHERE company_id=@company_id AND id=@id;
    `);

  return rs.recordset[0] ?? null;
}

export async function getQuoteItems(companyId: number, quoteId: number) {
  const pool = await getPool();
  const rs = await pool.request()
    .input("company_id", sql.Int, companyId)
    .input("quote_id", sql.Int, quoteId)
    .query<QuoteItemRow>(`
      SELECT
        qi.id, qi.quote_id, qi.product_id, qi.description, qi.quantity, qi.unit_price, qi.total,
        p.name AS product_name,
        p.sku AS product_sku,
        p.kind AS product_kind,
        p.uom AS product_uom
      FROM dbo.quote_items qi
      INNER JOIN dbo.quotes qt
        ON qt.id = qi.quote_id AND qt.company_id = @company_id
      INNER JOIN dbo.products p
        ON p.id = qi.product_id AND p.company_id = @company_id
      WHERE qi.quote_id = @quote_id
      ORDER BY qi.id ASC;
    `);

  return rs.recordset;
}

export async function createQuoteTx(args: {
  companyId: number;
  customerId: number;
  status: "draft" | "approved" | "cancelled";
  subtotal: number;
  discount: number;
  total: number;
  notes?: string | null;
  items: Array<{
    productId: number;
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
    const req = new sql.Request(tx);
    req.input("company_id", sql.Int, args.companyId);
    req.input("customer_id", sql.Int, args.customerId);
    req.input("status", sql.NVarChar(20), args.status);
    req.input("subtotal", sql.Decimal(18, 2), args.subtotal);
    req.input("discount", sql.Decimal(18, 2), args.discount);
    req.input("total", sql.Decimal(18, 2), args.total);
    req.input("notes", sql.NVarChar(500), args.notes ?? null);

    const inserted = await req.query<QuoteRow>(`
      INSERT INTO dbo.quotes (
        company_id, customer_id, status, subtotal, discount, total, notes, created_at, updated_at
      )
      OUTPUT INSERTED.id, INSERTED.company_id, INSERTED.customer_id, INSERTED.status,
             INSERTED.subtotal, INSERTED.discount, INSERTED.total, INSERTED.notes,
             INSERTED.created_at, INSERTED.updated_at, INSERTED.approved_at, INSERTED.cancelled_at
      VALUES (
        @company_id, @customer_id, @status, @subtotal, @discount, @total, @notes,
        SYSUTCDATETIME(), SYSUTCDATETIME()
      );
    `);

    const quote = inserted.recordset[0];

    for (const it of args.items) {
      const rqi = new sql.Request(tx);
      rqi.input("quote_id", sql.Int, quote.id);
      rqi.input("product_id", sql.Int, it.productId);
      rqi.input("description", sql.NVarChar(255), it.description);
      rqi.input("quantity", sql.Decimal(18, 3), it.quantity);
      rqi.input("unit_price", sql.Decimal(18, 2), it.unitPrice);
      rqi.input("total", sql.Decimal(18, 2), it.total);

      await rqi.query(`
        INSERT INTO dbo.quote_items (
          quote_id, product_id, description, quantity, unit_price, total
        )
        VALUES (
          @quote_id, @product_id, @description, @quantity, @unit_price, @total
        );
      `);
    }

    await tx.commit();

    const items = await getQuoteItems(args.companyId, quote.id);
    return { quote, items };
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

export async function replaceQuoteItemsTx(
  companyId: number,
  quoteId: number,
  items: Array<{
    productId: number;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>
) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);

  await tx.begin();

  try {
    // garante quote do tenant + lock leve
    const lock = new sql.Request(tx);
    lock.input("company_id", sql.Int, companyId);
    lock.input("quote_id", sql.Int, quoteId);

    const locked = await lock.query(`
      SELECT TOP 1 id
      FROM dbo.quotes WITH (UPDLOCK, ROWLOCK)
      WHERE company_id=@company_id AND id=@quote_id;
    `);

    if (!locked.recordset[0]) {
      await tx.rollback();
      return false;
    }

    // apaga itens antigos
    const del = new sql.Request(tx);
    del.input("quote_id", sql.Int, quoteId);
    await del.query(`DELETE FROM dbo.quote_items WHERE quote_id=@quote_id;`);

    // insere novos
    for (const it of items) {
      const ins = new sql.Request(tx);
      ins.input("quote_id", sql.Int, quoteId);
      ins.input("product_id", sql.Int, it.productId);
      ins.input("description", sql.NVarChar(255), it.description);
      ins.input("quantity", sql.Decimal(18, 3), it.quantity);
      ins.input("unit_price", sql.Decimal(18, 2), it.unitPrice);
      ins.input("total", sql.Decimal(18, 2), it.total);

      await ins.query(`
        INSERT INTO dbo.quote_items (quote_id, product_id, description, quantity, unit_price, total)
        VALUES (@quote_id, @product_id, @description, @quantity, @unit_price, @total);
      `);
    }

    // marca updated_at
    const upd = new sql.Request(tx);
    upd.input("company_id", sql.Int, companyId);
    upd.input("quote_id", sql.Int, quoteId);
    await upd.query(`
      UPDATE dbo.quotes
      SET updated_at = SYSUTCDATETIME()
      WHERE company_id=@company_id AND id=@quote_id;
    `);

    await tx.commit();
    return true;
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

export async function updateQuoteHeaderV2(
  companyId: number,
  quoteId: number,
  patch: {
    customerId?: number;
    notes?: string | null;
    discount?: number;
    subtotal: number;
    total: number;
  }
) {
  const pool = await getPool();
  const req = pool.request();

  req.input("company_id", sql.Int, companyId);
  req.input("quote_id", sql.Int, quoteId);

  req.input("customer_id", sql.Int, patch.customerId ?? null);

  // notes precisa suportar "set null" (limpar)
  const notesIsSet = typeof patch.notes !== "undefined";
  req.input("notes_is_set", sql.Bit, notesIsSet ? 1 : 0);
  req.input("notes", sql.NVarChar(500), notesIsSet ? (patch.notes ?? null) : null);

  req.input("discount", sql.Decimal(18, 2), typeof patch.discount === "number" ? patch.discount : null);
  req.input("subtotal", sql.Decimal(18, 2), patch.subtotal);
  req.input("total", sql.Decimal(18, 2), patch.total);

  const rs = await req.query<QuoteRow>(`
    UPDATE dbo.quotes
    SET
      customer_id = COALESCE(@customer_id, customer_id),
      notes = CASE WHEN @notes_is_set = 1 THEN @notes ELSE notes END,
      discount = COALESCE(@discount, discount),
      subtotal = @subtotal,
      total = @total,
      updated_at = SYSUTCDATETIME()
    OUTPUT INSERTED.id, INSERTED.company_id, INSERTED.customer_id, INSERTED.status,
           INSERTED.subtotal, INSERTED.discount, INSERTED.total, INSERTED.notes,
           INSERTED.created_at, INSERTED.updated_at, INSERTED.approved_at, INSERTED.cancelled_at
    WHERE company_id=@company_id AND id=@quote_id;
  `);

  return rs.recordset[0] ?? null;
}

export async function setQuoteStatus(
  companyId: number,
  quoteId: number,
  status: "approved" | "cancelled"
) {
  const pool = await getPool();
  const req = pool.request()
    .input("company_id", sql.Int, companyId)
    .input("quote_id", sql.Int, quoteId)
    .input("status", sql.NVarChar(20), status);

  const rs = await req.query<QuoteRow>(`
    UPDATE dbo.quotes
    SET
      status = @status,
      approved_at = CASE WHEN @status = 'approved' THEN SYSUTCDATETIME() ELSE approved_at END,
      cancelled_at = CASE WHEN @status = 'cancelled' THEN SYSUTCDATETIME() ELSE cancelled_at END,
      updated_at = SYSUTCDATETIME()
    OUTPUT INSERTED.id, INSERTED.company_id, INSERTED.customer_id, INSERTED.status,
           INSERTED.subtotal, INSERTED.discount, INSERTED.total, INSERTED.notes,
           INSERTED.created_at, INSERTED.updated_at, INSERTED.approved_at, INSERTED.cancelled_at
    WHERE company_id=@company_id AND id=@quote_id;
  `);

  return rs.recordset[0] ?? null;
}
