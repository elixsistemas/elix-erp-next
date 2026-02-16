import sql from "mssql";
import { getPool } from "../../config/db";
import type { BankBalanceEventListQuery } from "./bank_balance_events.schemas";

export async function createBankBalanceEvent(args: {
  companyId: number;
  bankAccountId: number;
  eventDate: string;       // YYYY-MM-DD
  amount: number;          // + entrada, - saída
  description?: string | null;
  sourceType?: "MANUAL" | "OFX" | "API" | "ADJUSTMENT";
  sourceRef?: string | null;
}) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", sql.Int, args.companyId)
    .input("bank_account_id", sql.Int, args.bankAccountId)
    .input("source_type", sql.NVarChar(20), args.sourceType ?? "MANUAL")
    .input("source_ref", sql.NVarChar(120), args.sourceRef ?? null)
    .input("event_date", sql.Date, args.eventDate)
    .input("amount", sql.Decimal(18, 2), args.amount)
    .input("description", sql.NVarChar(200), args.description ?? null)
    .query(`
      INSERT INTO dbo.bank_balance_events
        (company_id, bank_account_id, source_type, source_ref, event_date, amount, description)
      OUTPUT INSERTED.*
      VALUES
        (@company_id, @bank_account_id, @source_type, @source_ref, @event_date, @amount, @description)
    `);

  return r.recordset[0];
}

export async function listBankBalanceEvents(companyId: number, q: BankBalanceEventListQuery) {
  const pool = await getPool();

  // filtros opcionais
  const bankAccountId = q.bankAccountId ?? null;
  const from = q.from ?? null;
  const to = q.to ?? null;

  const r = await pool
    .request()
    .input("company_id", sql.Int, companyId)
    .input("bank_account_id", sql.Int, bankAccountId)
    .input("from", sql.Date, from)
    .input("to", sql.Date, to)
    .query(`
      SELECT e.*
      FROM dbo.bank_balance_events e
      WHERE e.company_id = @company_id
        AND (@bank_account_id IS NULL OR e.bank_account_id = @bank_account_id)
        AND (@from IS NULL OR e.event_date >= @from)
        AND (@to IS NULL OR e.event_date <= @to)
      ORDER BY e.event_date DESC, e.id DESC
    `);

  return r.recordset;
}

export async function deleteBankBalanceEvent(companyId: number, id: number) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", sql.Int, companyId)
    .input("id", sql.Int, id)
    .query(`
      DELETE FROM dbo.bank_balance_events
      OUTPUT DELETED.id
      WHERE company_id=@company_id AND id=@id
    `);

  return r.recordset[0] ?? null;
}
