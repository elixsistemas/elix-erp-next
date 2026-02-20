import sql from "mssql";
import { getPool } from "../../config/db";

function utcTodayYYYYMMDD() {
  return new Date().toISOString().slice(0, 10);
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export async function getSaleForClosing(companyId: number, saleId: number) {
  const pool = await getPool();
  const r = await pool.request()
    .input("company_id", companyId)
    .input("sale_id", saleId)
    .query(`
      SELECT id, company_id, status, total, payment_method_id, payment_term_id
      FROM dbo.sales
      WHERE company_id=@company_id AND id=@sale_id
    `);

  return r.recordset[0] ?? null;
}

export async function closeSaleWithReceivablesTx(args: {
  companyId: number;
  saleId: number;
  bankAccountId: number;
  documentNo: string | null;
  note: string | null;
  installments: Array<{ dueDate: string; amount: number }>;
}) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();

  try {
    // 1) trava venda
    const s = await new sql.Request(tx)
      .input("company_id", args.companyId)
      .input("sale_id", args.saleId)
      .query(`
        SELECT id, customer_id, status, total, payment_method_id, payment_term_id
        FROM dbo.sales WITH (UPDLOCK, ROWLOCK)
        WHERE company_id=@company_id AND id=@sale_id
      `);

    const sale = s.recordset[0] ?? null;
    if (!sale) {
      await tx.rollback();
      return { error: "SALE_NOT_FOUND" as const };
    }

    const status = String(sale.status ?? "").toLowerCase();

    if (status === "cancelled") {
      await tx.rollback();
      return { error: "SALE_CANCELLED" as const };
    }
    if (status === "closed") {
      await tx.rollback();
      return { error: "SALE_ALREADY_CLOSED" as const };
    }
    if (status !== "open") {
      await tx.rollback();
      return { error: "SALE_NOT_OPEN" as const };
    }

    if (!sale.payment_method_id) {
      await tx.rollback();
      return { error: "PAYMENT_METHOD_REQUIRED" as const };
    }
    if (!sale.payment_term_id) {
      await tx.rollback();
      return { error: "PAYMENT_TERM_REQUIRED" as const };
    }

    // 2) valida conta bancária (pertence à empresa e está ativa)
    const ba = await new sql.Request(tx)
      .input("company_id", args.companyId)
      .input("id", args.bankAccountId)
      .query(`
        SELECT TOP 1 id
        FROM dbo.bank_accounts
        WHERE company_id=@company_id AND id=@id AND active=1
      `);

    if (!ba.recordset[0]) {
      await tx.rollback();
      return { error: "BANK_ACCOUNT_INVALID" as const };
    }

    // 3) valida parcelas
    if (!args.installments?.length) {
      await tx.rollback();
      return { error: "INSTALLMENTS_INVALID" as const };
    }

    function toCents(n: number) {
      return Math.round(Number(n) * 100);
    }

    const saleTotalCents = toCents(Number(sale.total));
    const sumCents = args.installments.reduce((acc, it) => acc + toCents(Number(it.amount)), 0);

    if (sumCents !== saleTotalCents) {
      await tx.rollback();
      return { error: "INSTALLMENTS_INVALID" as const };
    }

    if (args.installments.some(it => Number(it.amount) <= 0)) {
      await tx.rollback();
      return { error: "INSTALLMENTS_INVALID" as const };
    }


    const exists = await new sql.Request(tx)
      .input("company_id", args.companyId)
      .input("sale_id", args.saleId)
      .query(`
        SELECT TOP 1 id
        FROM dbo.accounts_receivable WITH (UPDLOCK, HOLDLOCK)
        WHERE company_id=@company_id AND sale_id=@sale_id
      `);

    if (exists.recordset[0]) {
      await tx.rollback();
      return { error: "RECEIVABLE_ALREADY_EXISTS" as const };
    }


    // 4) cria N títulos (1 venda → N linhas)
    const issueDate = utcTodayYYYYMMDD();
    const totalInstallments = args.installments.length;

    for (let i = 0; i < totalInstallments; i++) {
      const it = args.installments[i];

      await new sql.Request(tx)
        .input("company_id", args.companyId)
        .input("sale_id", args.saleId)
        .input("customer_id", Number(sale.customer_id))
        .input("payment_method_id", Number(sale.payment_method_id))
        .input("payment_term_id", Number(sale.payment_term_id))
        .input("installment_number", i + 1)
        .input("total_installments", totalInstallments)
        .input("issue_date", issueDate)
        .input("due_date", it.dueDate)
        .input("amount", Number(it.amount))
        .input("status", "open")
        .input("bank_account_id", args.bankAccountId)
        .input("document_no", args.documentNo)
        .input("note", args.note)
        .query(`
          INSERT INTO dbo.accounts_receivable
            (company_id, sale_id, customer_id, payment_method_id, payment_term_id,
             installment_number, total_installments, issue_date, due_date, amount, status,
             bank_account_id, document_no, note, created_at)
          VALUES
            (@company_id, @sale_id, @customer_id, @payment_method_id, @payment_term_id,
             @installment_number, @total_installments, @issue_date, @due_date, @amount, @status,
             @bank_account_id, @document_no, @note, SYSUTCDATETIME())
        `);
    }

    // 5) fecha venda
    const u = await new sql.Request(tx)
      .input("company_id", args.companyId)
      .input("sale_id", args.saleId)
      .query(`
        UPDATE dbo.sales
        SET status='closed'
        OUTPUT INSERTED.id, INSERTED.status
        WHERE company_id=@company_id AND id=@sale_id AND status='open'
      `);

    await tx.commit();
    return { data: { sale: u.recordset[0], receivablesCreated: totalInstallments } };
    } catch (e: any) {
    const msg = String(e?.message ?? "");

    // 2627 = Violation of PRIMARY KEY/UNIQUE constraint
    // 2601 = Cannot insert duplicate key row in object with unique index
    if (e?.number === 2627 || e?.number === 2601 || msg.includes("UX_ar_sale_installment")) {
      await tx.rollback();
      return { error: "RECEIVABLE_ALREADY_EXISTS" as const };
    }

    await tx.rollback();
    throw e;
  }
}

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
    const occurredAt = sale?.created_at ?? null; // pode ser Date ou string, o driver costuma aceitar

    // 2) Insere itens + estoque OUT quando kind=product (com idempotência por item)
    for (const it of args.items) {
      // Insere item e pega o ID (pra idempotency_key)
      const itemRes = await new sql.Request(tx)
        .input("sale_id", saleId)
        .input("product_id", it.productId)
        .input("description", it.description)
        .input("quantity", it.quantity)
        .input("unit_price", it.unitPrice)
        .input("total", it.total)
        .query(`
          INSERT INTO sale_items (sale_id, product_id, description, quantity, unit_price, total)
          OUTPUT INSERTED.id
          VALUES (@sale_id, @product_id, @description, @quantity, @unit_price, @total)
        `);

      const saleItemId = Number(itemRes.recordset[0]?.id);
      if (!Number.isFinite(saleItemId) || saleItemId <= 0) {
        throw new Error("Failed to create sale item");
      }

      // Baixa estoque somente para produto
      if (it.kind === "product") {
        await new sql.Request(tx)
          .input("company_id", args.companyId)
          .input("product_id", it.productId)
          .input("type", "OUT")
          .input("quantity", it.quantity)
          .input("source", "SALE")
          .input("source_id", saleId)
          .input("note", `Auto OUT from sale #${saleId}`)

          // ✅ novos campos (ledger)
          .input("source_type", "SALE")
          .input("reason", "SALE")
          .input("idempotency_key", `SALE:${saleId}:ITEM:${saleItemId}`)
          .input("occurred_at", occurredAt)

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
        SELECT id, company_id, status, created_at
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

    // Pega itens + kind via join (estorna apenas produtos)
    const itemsRes = await new sql.Request(tx)
      .input("company_id", args.companyId)
      .input("sale_id", args.saleId)
      .query(`
        SELECT si.id, si.description, si.quantity, si.unit_price, si.total, p.kind
        FROM sale_items si
        INNER JOIN sales s ON s.id = si.sale_id AND s.company_id = @company_id
        INNER JOIN products p ON p.id = si.product_id AND p.company_id = @company_id
        WHERE si.sale_id=@sale_id
      `);

    for (const it of itemsRes.recordset) {
      const kind = String(it.kind ?? "").toLowerCase();
      if (kind !== "product") continue;

      const saleItemId = Number(it.id);
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

        // ✅ novos campos (ledger) + idempotência por item
        .input("source_type", "SALE")
        .input("reason", "RETURN")
        .input("idempotency_key", `SALE_CANCEL:${args.saleId}:ITEM:${saleItemId}`)
        .input("occurred_at", new Date().toISOString())

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

export async function closeSaleTx(args: { companyId: number; saleId: number }) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();

  try {
    const s = await new sql.Request(tx)
      .input("company_id", args.companyId)
      .input("sale_id", args.saleId)
      .query(`
        SELECT id, status
        FROM sales WITH (UPDLOCK, ROWLOCK)
        WHERE company_id=@company_id AND id=@sale_id
      `);

    const sale = s.recordset[0] ?? null;
    if (!sale) {
      await tx.rollback();
      return { error: "SALE_NOT_FOUND" as const };
    }

    const status = String(sale.status ?? "").toLowerCase();

    if (status === "cancelled") {
      await tx.rollback();
      return { error: "SALE_CANCELLED" as const };
    }

    if (status === "closed") {
      await tx.rollback();
      return { error: "SALE_ALREADY_CLOSED" as const };
    }

    if (status !== "open") {
      await tx.rollback();
      return { error: "SALE_NOT_OPEN" as const };
    }

    const u = await new sql.Request(tx)
      .input("company_id", args.companyId)
      .input("sale_id", args.saleId)
      .query(`
        UPDATE sales
        SET status='closed'
        OUTPUT INSERTED.id, INSERTED.status
        WHERE company_id=@company_id AND id=@sale_id AND status='open'
      `);

    await tx.commit();
    return { data: u.recordset[0] };
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}


