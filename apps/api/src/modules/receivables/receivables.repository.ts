import { getPool } from "../../config/db";
import sql from "mssql";

export async function createReceivableFromSale(args: {
  companyId: number;
  saleId: number;
  bankAccountId: number;
  dueDate: string;
  documentNo: string | null;
  note: string | null;
}) {
  const pool = await getPool();

  // 1️⃣ Carrega venda
  const saleRes = await pool.request()
    .input("company_id", args.companyId)
    .input("sale_id", args.saleId)
    .query(`
      SELECT id, customer_id, total
      FROM sales
      WHERE company_id=@company_id AND id=@sale_id
    `);

  const sale = saleRes.recordset[0] ?? null;
  if (!sale) return { error: "SALE_NOT_FOUND" as const };

  try {
    const r = await pool.request()
      .input("company_id", args.companyId)
      .input("sale_id", args.saleId)
      .input("customer_id", sale.customer_id)
      .input("bank_account_id", args.bankAccountId)
      .input("document_no", args.documentNo)
      .input("issue_date", new Date().toISOString().slice(0, 10))
      .input("due_date", args.dueDate)
      .input("amount", sale.total)
      .input("status", "open")
      .input("installment_number", 1)
      .input("total_installments", 1)
      .input("note", args.note)
      .query(`
        INSERT INTO dbo.accounts_receivable
        (company_id, sale_id, customer_id, bank_account_id, document_no,
         issue_date, due_date, amount, status,
         installment_number, total_installments, note, created_at)
        OUTPUT INSERTED.*
        VALUES
        (@company_id, @sale_id, @customer_id, @bank_account_id, @document_no,
         @issue_date, @due_date, @amount, @status,
         @installment_number, @total_installments, @note, SYSUTCDATETIME())
      `);

    return { data: r.recordset[0] };

  } catch (err: any) {
    const msg = String(err?.message ?? "");

    if (msg.includes("UX_accounts_receivable_sale")) {
      return { error: "RECEIVABLE_ALREADY_EXISTS" as const };
    }

    throw err;
  }
}

export async function listReceivables(companyId: number) {
  const pool = await getPool();

  const r = await pool.request()
    .input("company_id", companyId)
    .query(`
      SELECT *
      FROM accounts_receivable
      WHERE company_id=@company_id
      ORDER BY created_at DESC, id DESC
    `);

  return r.recordset;
}

export async function getReceivable(companyId: number, id: number) {
  const pool = await getPool();

  const r = await pool.request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      SELECT *
      FROM accounts_receivable
      WHERE company_id=@company_id AND id=@id
    `);

  return r.recordset[0] ?? null;
}

export async function payReceivable(args: {
  companyId: number;
  id: number;
}) {
  const pool = await getPool();

  const r = await pool.request()
    .input("company_id", args.companyId)
    .input("id", args.id)
    .input("paid_at", new Date())
    .query(`
      UPDATE accounts_receivable
      SET status='paid', paid_at=@paid_at
      OUTPUT INSERTED.*
      WHERE company_id=@company_id AND id=@id AND status='open'
    `);

  if (!r.recordset.length)
    return { error: "NOT_OPEN" as const };

  return { data: r.recordset[0] };
}

export async function cancelReceivable(args: {
  companyId: number;
  id: number;
}) {
  const pool = await getPool();

  const r = await pool.request()
    .input("company_id", args.companyId)
    .input("id", args.id)
    .query(`
      UPDATE accounts_receivable
      SET status='cancelled'
      OUTPUT INSERTED.*
      WHERE company_id=@company_id AND id=@id AND status='open'
    `);

  if (!r.recordset.length)
    return { error: "NOT_OPEN" as const };

  return { data: r.recordset[0] };
}
