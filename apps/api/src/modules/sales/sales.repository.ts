import { getPool } from "../../config/db";
import sql from "mssql";

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
            .input("source", "SALE")
            .input("source_id", saleId)
            .input("note", `Auto OUT from sale #${saleId}`)
            .execute("dbo.sp_inventory_move");
        }

    }

    // 3) Marca quote como approved
    await new sql.Request(tx)
      .input("company_id", args.companyId)
      .input("quote_id", args.quoteId)
      .query(`
        UPDATE quotes
        SET status='approved'
        WHERE company_id=@company_id AND id=@quote_id AND status='draft';

        IF @@ROWCOUNT = 0
        THROW 50010, 'Quote already processed', 1;
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

export async function listSales(args: {
  companyId: number;
  from?: string;
  to?: string;
  customerId?: number;
}) {
  const pool = await getPool();
  const req = pool.request().input("company_id", args.companyId);

  let where = "WHERE company_id=@company_id";

  if (args.customerId) {
    req.input("customer_id", args.customerId);
    where += " AND customer_id=@customer_id";
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
    SELECT id, company_id, customer_id, quote_id, status,
           subtotal, discount, total, notes, created_at
    FROM sales
    ${where}
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

export async function cancelSaleTx(args: { companyId: number; saleId: number }) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();

  try {
    const saleRes = await new sql.Request(tx)
      .input("company_id", args.companyId)
      .input("sale_id", args.saleId)
      .query(`
        SELECT id, company_id, status
        FROM sales WITH (UPDLOCK, ROWLOCK)
        WHERE company_id=@company_id AND id=@sale_id
      `);

    const sale = saleRes.recordset[0] ?? null;
    if (!sale) {
      await tx.rollback();
      return { error: "SALE_NOT_FOUND" as const };
    }

    const status = String(sale.status ?? "").toLowerCase();

    if (status === "cancelled") {
      await tx.rollback();
      return { error: "SALE_ALREADY_CANCELLED" as const };
    }

    if (status !== "open") {
      await tx.rollback();
      return { error: "SALE_NOT_OPEN" as const };
    }

    const itemsRes = await new sql.Request(tx)
      .input("sale_id", args.saleId)
      .query(`
        SELECT product_id, quantity
        FROM sale_items
        WHERE sale_id=@sale_id
      `);

    for (const it of itemsRes.recordset) {
      const qty = Number(it.quantity);

      if (!Number.isFinite(qty) || qty <= 0) {
        await tx.rollback();
        throw new Error("Invalid item quantity");
      }

      // enquanto sua SP for INT, exigimos inteiro
      if (!Number.isInteger(qty)) {
        await tx.rollback();
        throw new Error("Non-integer quantity not supported yet");
      }

      await new sql.Request(tx)
        .input("company_id", args.companyId)
        .input("product_id", Number(it.product_id))
        .input("type", "IN")
        .input("quantity", qty)
        .input("source", "SALE_CANCEL")
        .input("source_id", args.saleId)
        .input("note", `Reversal IN from cancelled sale #${args.saleId}`)
        .execute("dbo.sp_inventory_move");
    }

    await new sql.Request(tx)
      .input("company_id", args.companyId)
      .input("sale_id", args.saleId)
      .query(`
        UPDATE sales
        SET status='cancelled'
        WHERE company_id=@company_id AND id=@sale_id
      `);

    await tx.commit();
    return { data: { ok: true } };
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

export async function updateSale(args: {
  companyId: number;
  saleId: number;
  notes?: string | null;
  paymentMethodId?: number | null;
  paymentTermId?: number | null;
}) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", args.companyId)
    .input("sale_id", args.saleId)
    .input("notes", args.notes ?? null)
    .input("payment_method_id", args.paymentMethodId ?? null)
    .input("payment_term_id", args.paymentTermId ?? null)
    .query(`
      UPDATE sales
      SET
        notes = COALESCE(@notes, notes),
        payment_method_id = @payment_method_id,
        payment_term_id = @payment_term_id
      OUTPUT
        INSERTED.id,
        INSERTED.company_id,
        INSERTED.customer_id,
        INSERTED.quote_id,
        INSERTED.status,
        INSERTED.subtotal,
        INSERTED.discount,
        INSERTED.total,
        INSERTED.notes,
        INSERTED.created_at,
        INSERTED.payment_method_id,
        INSERTED.payment_term_id
      WHERE company_id=@company_id AND id=@sale_id
    `);

  return r.recordset[0] ?? null;
}


