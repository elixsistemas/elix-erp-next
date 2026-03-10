import { getPool } from "../../config/db";
import type {
  AccountsPayableCreate,
  AccountsPayableListQuery,
  AccountsPayableStatus,
  AccountsPayableUpdate,
} from "./accounts_payable.schema";

export type AccountsPayableRow = {
  id: number;
  company_id: number;
  supplier_id: number;
  supplier_name: string;
  document_number: string | null;
  issue_date: string;
  due_date: string;
  competence_date: string | null;
  description: string;
  amount: number;
  open_amount: number;
  status: AccountsPayableStatus;
  payment_term_id: number | null;
  payment_term_name: string | null;
  payment_method_id: number | null;
  payment_method_name: string | null;
  bank_account_id: number | null;
  bank_account_name: string | null;
  chart_account_id: number | null;
  chart_account_name: string | null;
  cost_center_id: number | null;
  cost_center_name: string | null;
  source_type: string | null;
  source_id: number | null;
  installment_no: number | null;
  installment_count: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
};

function baseSelect() {
  return `
    SELECT
      ap.id,
      ap.company_id,
      ap.supplier_id,
      s.name AS supplier_name,
      ap.document_number,
      CONVERT(varchar(10), ap.issue_date, 23) AS issue_date,
      CONVERT(varchar(10), ap.due_date, 23) AS due_date,
      CONVERT(varchar(10), ap.competence_date, 23) AS competence_date,
      ap.description,
      CAST(ap.amount AS decimal(18,2)) AS amount,
      CAST(ap.open_amount AS decimal(18,2)) AS open_amount,
      CASE
        WHEN ap.status = 'OPEN'
          AND ap.open_amount > 0
          AND ap.due_date < CAST(GETDATE() AS date)
        THEN 'OVERDUE'
        ELSE ap.status
      END AS status,
      ap.payment_term_id,
      pt.name AS payment_term_name,
      ap.payment_method_id,
      pm.name AS payment_method_name,
      ap.bank_account_id,
      ba.name AS bank_account_name,
      ap.chart_account_id,
      coa.name AS chart_account_name,
      ap.cost_center_id,
      cc.name AS cost_center_name,
      ap.source_type,
      ap.source_id,
      ap.installment_no,
      ap.installment_count,
      ap.notes,
      ap.created_at,
      ap.updated_at
    FROM dbo.accounts_payable ap
    INNER JOIN dbo.suppliers s
      ON s.id = ap.supplier_id
     AND s.company_id = ap.company_id
    LEFT JOIN dbo.payment_terms pt
      ON pt.id = ap.payment_term_id
     AND pt.company_id = ap.company_id
    LEFT JOIN dbo.payment_methods pm
      ON pm.id = ap.payment_method_id
     AND pm.company_id = ap.company_id
    LEFT JOIN dbo.bank_accounts ba
      ON ba.id = ap.bank_account_id
     AND ba.company_id = ap.company_id
    LEFT JOIN dbo.chart_of_accounts coa
      ON coa.id = ap.chart_account_id
     AND coa.company_id = ap.company_id
    LEFT JOIN dbo.cost_centers cc
      ON cc.id = ap.cost_center_id
     AND cc.company_id = ap.company_id
  `;
}

export async function createAccountsPayable(
  companyId: number,
  data: AccountsPayableCreate,
) {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("supplier_id", data.supplierId)
    .input("document_number", data.documentNumber ?? null)
    .input("issue_date", data.issueDate)
    .input("due_date", data.dueDate)
    .input("competence_date", data.competenceDate ?? null)
    .input("description", data.description)
    .input("amount", data.amount)
    .input("open_amount", data.amount)
    .input("status", "OPEN")
    .input("payment_term_id", data.paymentTermId ?? null)
    .input("payment_method_id", data.paymentMethodId ?? null)
    .input("bank_account_id", data.bankAccountId ?? null)
    .input("chart_account_id", data.chartAccountId ?? null)
    .input("cost_center_id", data.costCenterId ?? null)
    .input("source_type", "MANUAL")
    .input("source_id", null)
    .input("installment_no", data.installmentNo ?? null)
    .input("installment_count", data.installmentCount ?? null)
    .input("notes", data.notes ?? null)
    .query(`
      INSERT INTO dbo.accounts_payable (
        company_id,
        supplier_id,
        document_number,
        issue_date,
        due_date,
        competence_date,
        description,
        amount,
        open_amount,
        status,
        payment_term_id,
        payment_method_id,
        bank_account_id,
        chart_account_id,
        cost_center_id,
        source_type,
        source_id,
        installment_no,
        installment_count,
        notes
      )
      OUTPUT INSERTED.id
      VALUES (
        @company_id,
        @supplier_id,
        @document_number,
        @issue_date,
        @due_date,
        @competence_date,
        @description,
        @amount,
        @open_amount,
        @status,
        @payment_term_id,
        @payment_method_id,
        @bank_account_id,
        @chart_account_id,
        @cost_center_id,
        @source_type,
        @source_id,
        @installment_no,
        @installment_count,
        @notes
      )
    `);

  return Number(result.recordset[0]?.id);
}

export async function updateAccountsPayable(
  companyId: number,
  id: number,
  data: AccountsPayableUpdate,
) {
  const pool = await getPool();

  await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .input("supplier_id", data.supplierId)
    .input("document_number", data.documentNumber ?? null)
    .input("issue_date", data.issueDate)
    .input("due_date", data.dueDate)
    .input("competence_date", data.competenceDate ?? null)
    .input("description", data.description)
    .input("amount", data.amount)
    .input("payment_term_id", data.paymentTermId ?? null)
    .input("payment_method_id", data.paymentMethodId ?? null)
    .input("bank_account_id", data.bankAccountId ?? null)
    .input("chart_account_id", data.chartAccountId ?? null)
    .input("cost_center_id", data.costCenterId ?? null)
    .input("installment_no", data.installmentNo ?? null)
    .input("installment_count", data.installmentCount ?? null)
    .input("notes", data.notes ?? null)
    .query(`
      UPDATE dbo.accounts_payable
      SET
        supplier_id = @supplier_id,
        document_number = @document_number,
        issue_date = @issue_date,
        due_date = @due_date,
        competence_date = @competence_date,
        description = @description,
        amount = @amount,
        open_amount = CASE
          WHEN status IN ('OPEN', 'OVERDUE') THEN @amount
          ELSE open_amount
        END,
        payment_term_id = @payment_term_id,
        payment_method_id = @payment_method_id,
        bank_account_id = @bank_account_id,
        chart_account_id = @chart_account_id,
        cost_center_id = @cost_center_id,
        installment_no = @installment_no,
        installment_count = @installment_count,
        notes = @notes,
        updated_at = SYSUTCDATETIME()
      WHERE company_id = @company_id
        AND id = @id
        AND status NOT IN ('PAID', 'CANCELED')
    `);
}

export async function updateAccountsPayableStatus(
  companyId: number,
  id: number,
  status: AccountsPayableStatus,
) {
  const pool = await getPool();

  await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .input("status", status)
    .query(`
      UPDATE dbo.accounts_payable
      SET
        status = @status,
        open_amount = CASE
          WHEN @status IN ('PAID', 'CANCELED') THEN 0
          ELSE open_amount
        END,
        updated_at = SYSUTCDATETIME()
      WHERE company_id = @company_id
        AND id = @id
    `);
}

export async function getAccountsPayableById(companyId: number, id: number) {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query<AccountsPayableRow>(`
      ${baseSelect()}
      WHERE ap.company_id = @company_id
        AND ap.id = @id
    `);

  return result.recordset[0] ?? null;
}

export async function listAccountsPayable(
  companyId: number,
  query: AccountsPayableListQuery,
) {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("supplier_id", query.supplierId ?? null)
    .input("status", query.status ?? null)
    .input("q", query.q ? `%${query.q}%` : null)
    .input("issue_date_from", query.issueDateFrom ?? null)
    .input("issue_date_to", query.issueDateTo ?? null)
    .input("due_date_from", query.dueDateFrom ?? null)
    .input("due_date_to", query.dueDateTo ?? null)
    .input("overdue_only", query.overdueOnly ? 1 : 0)
    .input("limit", query.limit)
    .input("offset", query.offset)
    .query<AccountsPayableRow>(`
      ${baseSelect()}
      WHERE ap.company_id = @company_id
        AND (@supplier_id IS NULL OR ap.supplier_id = @supplier_id)
        AND (
          @status IS NULL
          OR (
            @status = 'OVERDUE'
            AND ap.status = 'OPEN'
            AND ap.open_amount > 0
            AND ap.due_date < CAST(GETDATE() AS date)
          )
          OR (
            @status <> 'OVERDUE'
            AND ap.status = @status
          )
        )
        AND (
          @q IS NULL
          OR ap.description LIKE @q
          OR ap.document_number LIKE @q
          OR s.name LIKE @q
        )
        AND (@issue_date_from IS NULL OR ap.issue_date >= @issue_date_from)
        AND (@issue_date_to IS NULL OR ap.issue_date <= @issue_date_to)
        AND (@due_date_from IS NULL OR ap.due_date >= @due_date_from)
        AND (@due_date_to IS NULL OR ap.due_date <= @due_date_to)
        AND (
          @overdue_only = 0
          OR (
            ap.status = 'OPEN'
            AND ap.open_amount > 0
            AND ap.due_date < CAST(GETDATE() AS date)
          )
        )
      ORDER BY ap.due_date ASC, ap.id DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

  return result.recordset;
}