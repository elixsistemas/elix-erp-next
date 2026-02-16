import { getPool } from "../../config/db";

export async function listReceivables(companyId: number) {
  const pool = await getPool();
  const r = await pool.request().input("company_id", companyId).query(`
    SELECT *
    FROM dbo.accounts_receivable
    WHERE company_id=@company_id
    ORDER BY created_at DESC, id DESC
  `);
  return r.recordset;
}

export async function getReceivable(companyId: number, id: number) {
  const pool = await getPool();
  const r = await pool.request().input("company_id", companyId).input("id", id).query(`
    SELECT *
    FROM dbo.accounts_receivable
    WHERE company_id=@company_id AND id=@id
  `);
  return r.recordset[0] ?? null;
}

export async function createReceivableFromSale(args: {
  companyId: number;
  saleId: number;
  customerId: number;
  bankAccountId: number;
  dueDate: string; // YYYY-MM-DD
  amount: number;
  documentNo: string | null;
  note: string | null;
}) {
    try {
  const pool = await getPool();

  const r = await pool.request()
    .input("company_id", args.companyId)
    .input("sale_id", args.saleId)
    .input("customer_id", args.customerId)
    .input("bank_account_id", args.bankAccountId)
    .input("document_no", args.documentNo)
    .input("issue_date", new Date().toISOString().slice(0, 10)) // YYYY-MM-DD (UTC)
    .input("due_date", args.dueDate)
    .input("amount", args.amount)
    .input("status", "open")
    .input("installment_number", 1)
    .input("total_installments", 1)
    .input("note", args.note)
    .query(`
      INSERT INTO dbo.accounts_receivable
        (company_id, sale_id, customer_id, bank_account_id, document_no,
         issue_date, due_date, amount, status, installment_number, total_installments, note, created_at)
      OUTPUT INSERTED.*
      VALUES
        (@company_id, @sale_id, @customer_id, @bank_account_id, @document_no,
         @issue_date, @due_date, @amount, @status, @installment_number, @total_installments, @note, SYSUTCDATETIME())
    `);

  return r.recordset[0];
    } catch (err: any) {
    const msg = String(err?.message ?? "");

    if (msg.includes("UX_accounts_receivable_sale")) {
        return { error: "RECEIVABLE_ALREADY_EXISTS" as const };
    }

    throw err;
    }
}


export async function updateReceivable(args: {
  companyId: number;
  id: number;
  dueDate?: string;
  documentNo?: string | null;
  note?: string | null;
}) {
  const pool = await getPool();
  const r = await pool.request()
    .input("company_id", args.companyId)
    .input("id", args.id)
    .input("due_date", args.dueDate ?? null)
    .input("document_no", args.documentNo ?? null)
    .input("note", args.note ?? null)
    .query(`
      UPDATE dbo.accounts_receivable
      SET
        due_date = COALESCE(@due_date, due_date),
        document_no = COALESCE(@document_no, document_no),
        note = COALESCE(@note, note)
      OUTPUT INSERTED.*
      WHERE company_id=@company_id AND id=@id
    `);

  return r.recordset[0] ?? null;
}

export async function cancelReceivable(args: { companyId: number; id: number }) {
  const pool = await getPool();

  const cur = await pool.request().input("company_id", args.companyId).input("id", args.id).query(`
    SELECT id, status
    FROM dbo.accounts_receivable
    WHERE company_id=@company_id AND id=@id
  `);

  const row = cur.recordset[0] ?? null;
  if (!row) return { error: "NOT_FOUND" as const };

  if (String(row.status).toLowerCase() !== "open") {
    return { error: "NOT_OPEN" as const };
  }

  await pool.request().input("company_id", args.companyId).input("id", args.id).query(`
    UPDATE dbo.accounts_receivable
    SET status='cancelled'
    WHERE company_id=@company_id AND id=@id
  `);

  return { data: { ok: true } };
}

export async function getReceivableBySale(companyId: number, saleId: number) {
  const pool = await getPool();

  const r = await pool.request()
    .input("company_id", companyId)
    .input("sale_id", saleId)
    .query(`
      SELECT TOP 1 *
      FROM dbo.accounts_receivable
      WHERE company_id=@company_id AND sale_id=@sale_id
      ORDER BY id DESC
    `);

  return r.recordset[0] ?? null;
}

export async function issueReceivableMock(args: { companyId: number; id: number }) {
  const pool = await getPool();

  const cur = await pool.request().input("company_id", args.companyId).input("id", args.id).query(`
    SELECT id, status
    FROM dbo.accounts_receivable
    WHERE company_id=@company_id AND id=@id
  `);

  const row = cur.recordset[0] ?? null;
  if (!row) return { error: "NOT_FOUND" as const };

  if (String(row.status).toLowerCase() !== "open") {
    return { error: "NOT_OPEN" as const };
  }

  // mock: marca como "emitido" preenchendo campos fake
  const u = await pool.request()
    .input("company_id", args.companyId)
    .input("id", args.id)
    .query(`
      UPDATE dbo.accounts_receivable
      SET
        issued_at = SYSUTCDATETIME(),
        provider = 'mock',
        provider_ref = CONCAT('MOCK-', id),
        barcode = CONCAT('BARCODE-', id),
        digitable_line = CONCAT('LINE-', id)
      OUTPUT INSERTED.*
      WHERE company_id=@company_id AND id=@id
    `);

  return { data: u.recordset[0] };
}
