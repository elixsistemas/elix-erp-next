import { getPool } from "../../config/db";
import type { QuoteCreate, QuoteItemCreate, QuoteUpdate } from "./quotes.schema";
import sql from "mssql";

export type QuoteRow = {
  id: number;
  company_id: number;
  customer_id: number;
  status: string;
  subtotal: number;
  discount: number;
  total: number;
  notes: string | null;
  created_at: string;
};

export type QuoteItemRow = {
  id: number;
  quote_id: number;
  product_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
};

export async function ensureCustomerBelongs(companyId: number, customerId: number) {
  const pool = await getPool();
  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("customer_id", customerId)
    .query(`
      SELECT TOP 1 id
      FROM customers
      WHERE company_id=@company_id AND id=@customer_id
    `);
  return !!r.recordset[0];
}

export async function ensureProductsBelong(companyId: number, productIds: number[]) {
  const pool = await getPool();
  const ids = [...new Set(productIds)];
  if (ids.length === 0) return true;

  // Conta quantos existem na empresa
  const request = pool.request().input("company_id", companyId);
  ids.forEach((id, i) => request.input(`p${i}`, id));

  const inList = ids.map((_, i) => `@p${i}`).join(",");

  const r = await request.query(`
    SELECT COUNT(*) as cnt
    FROM products
    WHERE company_id=@company_id AND id IN (${inList})
  `);

  return Number(r.recordset[0]?.cnt ?? 0) === ids.length;
}

export async function createQuoteTx(args: {
  companyId: number;
  customerId: number;
  discount: number;
  notes?: string;
  subtotal: number;
  total: number;
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
    const header = await new sql.Request(tx)
      .input("company_id", args.companyId)
      .input("customer_id", args.customerId)
      .input("discount", args.discount)
      .input("subtotal", args.subtotal)
      .input("total", args.total)
      .input("notes", args.notes ?? null)
      .query(`
        INSERT INTO quotes (company_id, customer_id, discount, subtotal, total, notes)
        OUTPUT INSERTED.*
        VALUES (@company_id, @customer_id, @discount, @subtotal, @total, @notes)
      `);

    const quote = header.recordset[0] as QuoteRow;

    for (const it of args.items) {
      await new sql.Request(tx)
        .input("quote_id", quote.id)
        .input("product_id", it.productId)
        .input("description", it.description)
        .input("quantity", it.quantity)
        .input("unit_price", it.unitPrice)
        .input("total", it.total)
        .query(`
          INSERT INTO quote_items (quote_id, product_id, description, quantity, unit_price, total)
          VALUES (@quote_id, @product_id, @description, @quantity, @unit_price, @total)
        `);
    }

    const itemsRes = await new sql.Request(tx)
      .input("quote_id", quote.id)
      .query(`
        SELECT id, quote_id, product_id, description, quantity, unit_price, total
        FROM quote_items
        WHERE quote_id=@quote_id
        ORDER BY id
      `);

    await tx.commit();

    return { quote, items: itemsRes.recordset as QuoteItemRow[] };
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

export async function listQuotes(companyId: number): Promise<QuoteRow[]> {
  const pool = await getPool();
  const r = await pool
    .request()
    .input("company_id", companyId)
    .query(`
      SELECT id, company_id, customer_id, status, subtotal, discount, total, notes, created_at
      FROM quotes
      WHERE company_id=@company_id
      ORDER BY created_at DESC, id DESC
    `);
  return r.recordset as QuoteRow[];
}

export async function getQuote(companyId: number, id: number): Promise<QuoteRow | null> {
  const pool = await getPool();
  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      SELECT id, company_id, customer_id, status, subtotal, discount, total, notes, created_at
      FROM quotes
      WHERE company_id=@company_id AND id=@id
    `);
  return (r.recordset[0] as QuoteRow) ?? null;
}

export async function getQuoteItems(companyId: number, quoteId: number): Promise<QuoteItemRow[]> {
  const pool = await getPool();
  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("quote_id", quoteId)
    .query(`
      SELECT qi.id, qi.quote_id, qi.product_id, qi.description, qi.quantity, qi.unit_price, qi.total
      FROM quote_items qi
      INNER JOIN quotes q ON q.id = qi.quote_id
      WHERE q.company_id=@company_id AND qi.quote_id=@quote_id
      ORDER BY qi.id
    `);
  return r.recordset as QuoteItemRow[];
}

export async function updateQuoteHeader(
  companyId: number,
  id: number,
  data: QuoteUpdate
): Promise<QuoteRow | null> {
  const pool = await getPool();
  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .input("status", data.status ?? null)
    .input("discount", typeof data.discount === "number" ? data.discount : null)
    .input("notes", data.notes ?? null)
    .query(`
      UPDATE quotes
      SET
        status = COALESCE(@status, status),
        discount = COALESCE(@discount, discount),
        notes = COALESCE(@notes, notes)
      OUTPUT INSERTED.id, INSERTED.company_id, INSERTED.customer_id, INSERTED.status,
             INSERTED.subtotal, INSERTED.discount, INSERTED.total, INSERTED.notes, INSERTED.created_at
      WHERE company_id=@company_id AND id=@id
    `);

  return (r.recordset[0] as QuoteRow) ?? null;
}

export async function setQuoteTotals(
  companyId: number,
  id: number,
  subtotal: number,
  discount: number,
  total: number
): Promise<void> {
  const pool = await getPool();
  await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .input("subtotal", subtotal)
    .input("discount", discount)
    .input("total", total)
    .query(`
      UPDATE quotes
      SET subtotal=@subtotal, discount=@discount, total=@total
      WHERE company_id=@company_id AND id=@id
    `);
}
