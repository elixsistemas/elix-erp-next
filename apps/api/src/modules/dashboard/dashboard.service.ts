import sql from "mssql";
import { getPool } from "@/config/db";
import type { DashboardFinanceInput } from "./dashboard.schemas";

function monthRange(month?: string) {
  const now = new Date();
  const y = month ? Number(month.slice(0, 4)) : now.getFullYear();
  const m = month ? Number(month.slice(5, 7)) : now.getMonth() + 1;

  const start = `${y}-${String(m).padStart(2, "0")}-01`;

  const nextM = m === 12 ? 1 : m + 1;
  const nextY = m === 12 ? y + 1 : y;
  const end = `${nextY}-${String(nextM).padStart(2, "0")}-01`;

  return { start, end };
}

export async function getFinanceSummary(input: DashboardFinanceInput) {
  const pool = await getPool();
  const { start, end } = monthRange(input.month);

  const byAccount = await pool
    .request()
    .input("companyId", sql.Int, input.companyId)
    .query(`
      SELECT 
        ba.id,
        ba.name,
        ba.bank_code,
        ba.agency,
        ba.account,
        ba.account_digit,
        CAST(ISNULL(SUM(e.amount), 0) AS DECIMAL(18,2)) AS balance
      FROM dbo.bank_accounts ba
      LEFT JOIN dbo.bank_balance_events e
        ON e.bank_account_id = ba.id AND e.company_id = ba.company_id
      WHERE ba.company_id = @companyId AND ba.active = 1
      GROUP BY ba.id, ba.name, ba.bank_code, ba.agency, ba.account, ba.account_digit
      ORDER BY ba.name;
    `);

  const monthlyMov = await pool
    .request()
    .input("companyId", sql.Int, input.companyId)
    .input("start", sql.Date, start)
    .input("end", sql.Date, end)
    .query(`
      SELECT
        CAST(ISNULL(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS DECIMAL(18,2)) AS inflow_month,
        CAST(ISNULL(SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END), 0) AS DECIMAL(18,2)) AS outflow_month
      FROM dbo.bank_balance_events
      WHERE company_id = @companyId
        AND event_date >= @start
        AND event_date <  @end;
    `);

  const accounts = byAccount.recordset ?? [];
  const inflowMonth = Number(monthlyMov.recordset?.[0]?.inflow_month ?? 0);
  const outflowMonth = Number(monthlyMov.recordset?.[0]?.outflow_month ?? 0);

  const totalBalance = accounts.reduce((acc: number, a: any) => acc + Number(a.balance ?? 0), 0);
  const netMonth = inflowMonth - outflowMonth;

  return {
    companyId: input.companyId,
    month: input.month ?? null,
    totalBalance,
    inflowMonth,
    outflowMonth,
    netMonth,
    accounts,
  };
}
