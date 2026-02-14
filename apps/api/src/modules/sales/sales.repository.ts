import { getPool } from "../../config/db";
import sql from "mssql";

console.log("exports sales.repository loaded");
export const __exportsCheck = [
  typeof loadQuoteWithItems,
  typeof convertQuoteToSaleTx,
  typeof listSales,
  typeof getSale
];
console.log("__exportsCheck", __exportsCheck);

type QuoteRow = {
  id: number;
  customer_id: number;
  status: "draft" | "approved" | "cancelled";
  subtotal: number;
  discount: number;
  total: number;
  notes: string | null;
};

type QuoteItemRow = {
  product_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  kind: "product" | "service";
};

export async function loadQuoteWithItems(companyId: number, quoteId: number) {
  const pool = await getPool();

  const q = await pool
    .request()
    .input("company_id", companyId)
    .input("quote_id", quoteId)
    .query(`
      SELECT id, customer_id, status, subtotal, discount, total, notes
      FROM quotes
      WHERE company_id=@company_id AND id=@quote_id
    `);

  const quote = (q.recordset[0] as QuoteRow) ?? null;
  if (!quote) return null;

  const itemsRes = await pool
    .request()
    .input("company_id", companyId)
    .input("quote_id", quoteId)
    .query(`
      SELECT
        qi.product_id,
        qi.description,
        qi.quantity,
        qi.unit_price,
        qi.total,
        p.kind
      FROM quote_items qi
      INNER JOIN quotes q ON q.id = qi.quote_id
      INNER JOIN products p ON p.id = qi.product_id AND p.company_id = q.company_id
      WHERE q.company_id=@company_id AND qi.quote_id=@quote_id
      ORDER BY qi.id
    `);

  return { quote, items: itemsRes.recordset as QuoteItemRow[] };
}

export async function convertQuoteToSaleTx(args: {
  companyId: number;
  quoteId: number;
  customerId: number;
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
    kind: "product" | "service";
  }>;
}) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();

  try {
    // 1) Cria sale
    const saleRes = await new sql.Request(tx)
      .input("company_id", args.companyId)
      .input("customer_id", args.customerId)
      .input("quote_id", args.quoteId)
      .input("subtotal", args.subtotal)
      .input("discount", args.discount)
      .input("total", args.total)
      .input("notes", args.notes ?? null)
      .query(`
        INSERT INTO sales (company_id, customer_id, quote_id, subtotal, discount, total, notes)
        OUTPUT INSERTED.id, INSERTED.company_id, INSERTED.customer_id, INSERTED.quote_id,
               INSERTED.status, INSERTED.subtotal, INSERTED.discount, INSERTED.total, INSERTED.notes, INSERTED.created_at
        VALUES (@company_id, @customer_id, @quote_id, @subtotal, @discount, @total, @notes)
      `);

    const sale = saleRes.recordset[0];
    const saleId = Number(sale.id);

    // 2) Insere itens + estoque OUT quando kind=product
    for (const it of args.items) {
      await new sql.Request(tx)
        .input("sale_id", saleId)
        .input("product_id", it.productId)
        .input("description", it.description)
        .input("quantity", it.quantity)
        .input("unit_price", it.unitPrice)
        .input("total", it.total)
        .query(`
          INSERT INTO sale_items (sale_id, product_id, description, quantity, unit_price, total)
          VALUES (@sale_id, @product_id, @description, @quantity, @unit_price, @total)
        `);

      if (it.kind === "product") {
        await new sql.Request(tx)
          .input("company_id", args.companyId)
          .input("product_id", it.productId)
          .input("type", "OUT")
          .input("quantity", it.quantity)
          .input("source", "sale")
          .input("source_id", saleId)
          .input("note", `Auto OUT from sale #${saleId}`)
          .query(`
            INSERT INTO inventory_movements (company_id, product_id, type, quantity, source, source_id, note)
            VALUES (@company_id, @product_id, @type, @quantity, @source, @source_id, @note)
          `);
      }
    }

    // 3) Marca quote como approved
    await new sql.Request(tx)
      .input("company_id", args.companyId)
      .input("quote_id", args.quoteId)
      .query(`
        UPDATE quotes
        SET status='approved'
        WHERE company_id=@company_id AND id=@quote_id
      `);

    // 4) Retorna sale + items
    const itemsRes = await new sql.Request(tx)
      .input("sale_id", saleId)
      .query(`
        SELECT id, sale_id, product_id, description, quantity, unit_price, total
        FROM sale_items
        WHERE sale_id=@sale_id
        ORDER BY id
      `);

    await tx.commit();
    return { sale, items: itemsRes.recordset };
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

export async function listSales(companyId: number) {
  const pool = await getPool();
  const r = await pool
    .request()
    .input("company_id", companyId)
    .query(`
      SELECT id, company_id, customer_id, quote_id, status, subtotal, discount, total, notes, created_at
      FROM sales
      WHERE company_id=@company_id
      ORDER BY created_at DESC, id DESC
    `);
  return r.recordset;
}

export async function getSale(companyId: number, saleId: number) {
  const pool = await getPool();
  const s = await pool
    .request()
    .input("company_id", companyId)
    .input("sale_id", saleId)
    .query(`
      SELECT id, company_id, customer_id, quote_id, status, subtotal, discount, total, notes, created_at
      FROM sales
      WHERE company_id=@company_id AND id=@sale_id
    `);

  const sale = s.recordset[0] ?? null;
  if (!sale) return null;

  const items = await pool
    .request()
    .input("sale_id", saleId)
    .query(`
      SELECT id, sale_id, product_id, description, quantity, unit_price, total
      FROM sale_items
      WHERE sale_id=@sale_id
      ORDER BY id
    `);

  return { sale, items: items.recordset };
}
