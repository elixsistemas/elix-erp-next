import { getPool } from "../../config/db";

type CreateBankAccountArgs = {
  companyId: number;
  bankCode: string;
  name: string;
  agency?: string | null;
  account?: string | null;
  accountDigit?: string | null;
  convenio?: string | null;
  wallet?: string | null;
  settingsJson?: string | null;

  accountType?: string | null;
  bankName?: string | null;
  bankIspb?: string | null;
  branchDigit?: string | null;
  holderName?: string | null;
  holderDocument?: string | null;
  pixKeyType?: string | null;
  pixKeyValue?: string | null;
  isDefault?: boolean;
  allowReceipts?: boolean;
  allowPayments?: boolean;
  reconciliationEnabled?: boolean;
  externalCode?: string | null;
  notes?: string | null;
};

type UpdateBankAccountArgs = {
  companyId: number;
  id: number;
  bankCode?: string | null;
  name?: string | null;
  agency?: string | null;
  account?: string | null;
  accountDigit?: string | null;
  convenio?: string | null;
  wallet?: string | null;
  settingsJson?: string | null;

  accountType?: string | null;
  bankName?: string | null;
  bankIspb?: string | null;
  branchDigit?: string | null;
  holderName?: string | null;
  holderDocument?: string | null;
  pixKeyType?: string | null;
  pixKeyValue?: string | null;
  isDefault?: boolean;
  allowReceipts?: boolean;
  allowPayments?: boolean;
  reconciliationEnabled?: boolean;
  externalCode?: string | null;
  notes?: string | null;
};

export async function createBankAccount(args: CreateBankAccountArgs) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", args.companyId)
    .input("bank_code", args.bankCode)
    .input("name", args.name)
    .input("agency", args.agency ?? null)
    .input("account", args.account ?? null)
    .input("account_digit", args.accountDigit ?? null)
    .input("convenio", args.convenio ?? null)
    .input("wallet", args.wallet ?? null)
    .input("settings_json", args.settingsJson ?? null)
    .input("account_type", args.accountType ?? "checking")
    .input("bank_name", args.bankName ?? null)
    .input("bank_ispb", args.bankIspb ?? null)
    .input("branch_digit", args.branchDigit ?? null)
    .input("holder_name", args.holderName ?? null)
    .input("holder_document", args.holderDocument ?? null)
    .input("pix_key_type", args.pixKeyType ?? null)
    .input("pix_key_value", args.pixKeyValue ?? null)
    .input("is_default", args.isDefault ? 1 : 0)
    .input("allow_receipts", args.allowReceipts ?? true ? 1 : 0)
    .input("allow_payments", args.allowPayments ?? true ? 1 : 0)
    .input("reconciliation_enabled", args.reconciliationEnabled ?? true ? 1 : 0)
    .input("external_code", args.externalCode ?? null)
    .input("notes", args.notes ?? null)
    .query(`
      INSERT INTO dbo.bank_accounts (
        company_id,
        bank_code,
        name,
        agency,
        account,
        account_digit,
        convenio,
        wallet,
        settings_json,
        account_type,
        bank_name,
        bank_ispb,
        branch_digit,
        holder_name,
        holder_document,
        pix_key_type,
        pix_key_value,
        is_default,
        allow_receipts,
        allow_payments,
        reconciliation_enabled,
        external_code,
        notes
      )
      OUTPUT INSERTED.*
      VALUES (
        @company_id,
        @bank_code,
        @name,
        @agency,
        @account,
        @account_digit,
        @convenio,
        @wallet,
        @settings_json,
        @account_type,
        @bank_name,
        @bank_ispb,
        @branch_digit,
        @holder_name,
        @holder_document,
        @pix_key_type,
        @pix_key_value,
        @is_default,
        @allow_receipts,
        @allow_payments,
        @reconciliation_enabled,
        @external_code,
        @notes
      )
    `);

  if (args.isDefault) {
    await enforceSingleDefault(args.companyId, r.recordset[0].id);
  }

  return r.recordset[0];
}

export async function listBankAccounts(companyId: number, active?: boolean) {
  const pool = await getPool();
  const req = pool.request().input("company_id", companyId);

  let where = "WHERE company_id=@company_id";

  if (typeof active === "boolean") {
    req.input("active", active ? 1 : 0);
    where += " AND active=@active";
  }

  const r = await req.query(`
    SELECT *
    FROM dbo.bank_accounts
    ${where}
    ORDER BY is_default DESC, active DESC, id DESC
  `);

  return r.recordset;
}

export async function updateBankAccount(args: UpdateBankAccountArgs) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", args.companyId)
    .input("id", args.id)
    .input("bank_code", args.bankCode ?? null)
    .input("name", args.name ?? null)
    .input("agency", args.agency ?? null)
    .input("account", args.account ?? null)
    .input("account_digit", args.accountDigit ?? null)
    .input("convenio", args.convenio ?? null)
    .input("wallet", args.wallet ?? null)
    .input("settings_json", args.settingsJson ?? null)
    .input("account_type", args.accountType ?? null)
    .input("bank_name", args.bankName ?? null)
    .input("bank_ispb", args.bankIspb ?? null)
    .input("branch_digit", args.branchDigit ?? null)
    .input("holder_name", args.holderName ?? null)
    .input("holder_document", args.holderDocument ?? null)
    .input("pix_key_type", args.pixKeyType ?? null)
    .input("pix_key_value", args.pixKeyValue ?? null)
    .input(
      "is_default",
      typeof args.isDefault === "boolean" ? (args.isDefault ? 1 : 0) : null,
    )
    .input(
      "allow_receipts",
      typeof args.allowReceipts === "boolean"
        ? (args.allowReceipts ? 1 : 0)
        : null,
    )
    .input(
      "allow_payments",
      typeof args.allowPayments === "boolean"
        ? (args.allowPayments ? 1 : 0)
        : null,
    )
    .input(
      "reconciliation_enabled",
      typeof args.reconciliationEnabled === "boolean"
        ? (args.reconciliationEnabled ? 1 : 0)
        : null,
    )
    .input("external_code", args.externalCode ?? null)
    .input("notes", args.notes ?? null)
    .query(`
      UPDATE dbo.bank_accounts
      SET
        bank_code = COALESCE(@bank_code, bank_code),
        name = COALESCE(@name, name),
        agency = @agency,
        account = @account,
        account_digit = @account_digit,
        convenio = @convenio,
        wallet = @wallet,
        settings_json = @settings_json,
        account_type = COALESCE(@account_type, account_type),
        bank_name = @bank_name,
        bank_ispb = @bank_ispb,
        branch_digit = @branch_digit,
        holder_name = @holder_name,
        holder_document = @holder_document,
        pix_key_type = @pix_key_type,
        pix_key_value = @pix_key_value,
        is_default = COALESCE(@is_default, is_default),
        allow_receipts = COALESCE(@allow_receipts, allow_receipts),
        allow_payments = COALESCE(@allow_payments, allow_payments),
        reconciliation_enabled = COALESCE(@reconciliation_enabled, reconciliation_enabled),
        external_code = @external_code,
        notes = @notes,
        updated_at = SYSUTCDATETIME()
      OUTPUT INSERTED.*
      WHERE company_id=@company_id AND id=@id
    `);

  const row = r.recordset[0] ?? null;

  if (row && row.is_default) {
    await enforceSingleDefault(args.companyId, row.id);
  }

  return row;
}

export async function deactivateBankAccount(companyId: number, id: number) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      UPDATE dbo.bank_accounts
      SET
        active = 0,
        updated_at = SYSUTCDATETIME()
      OUTPUT INSERTED.id, INSERTED.active
      WHERE company_id=@company_id AND id=@id AND active=1
    `);

  return r.recordset[0] ?? null;
}

export async function activateBankAccount(companyId: number, id: number) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      UPDATE dbo.bank_accounts
      SET
        active = 1,
        updated_at = SYSUTCDATETIME()
      OUTPUT INSERTED.id, INSERTED.active
      WHERE company_id=@company_id AND id=@id AND active=0
    `);

  return r.recordset[0] ?? null;
}

async function enforceSingleDefault(companyId: number, keepId: number) {
  const pool = await getPool();

  await pool
    .request()
    .input("company_id", companyId)
    .input("keep_id", keepId)
    .query(`
      UPDATE dbo.bank_accounts
      SET
        is_default = 0,
        updated_at = SYSUTCDATETIME()
      WHERE company_id=@company_id
        AND id <> @keep_id
        AND is_default = 1
    `);
}