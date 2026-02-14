import { getPool } from "../../config/db";

export async function listBankAccounts(companyId: number) {
  const pool = await getPool();
  const r = await pool.request().input("company_id", companyId).query(`
    SELECT id, company_id, bank_code, name, agency, account, account_digit, convenio, wallet, settings_json, active, created_at
    FROM dbo.bank_accounts
    WHERE company_id=@company_id
    ORDER BY active DESC, id DESC
  `);
  return r.recordset;
}

export async function getBankAccount(companyId: number, id: number) {
  const pool = await getPool();
  const r = await pool.request().input("company_id", companyId).input("id", id).query(`
    SELECT id, company_id, bank_code, name, agency, account, account_digit, convenio, wallet, settings_json, active, created_at
    FROM dbo.bank_accounts
    WHERE company_id=@company_id AND id=@id
  `);
  return r.recordset[0] ?? null;
}

export async function createBankAccount(args: {
  companyId: number;
  bankCode: string;
  name: string;
  agency?: string | null;
  account?: string | null;
  accountDigit?: string | null;
  convenio?: string | null;
  wallet?: string | null;
  settings?: any | null;
  active?: boolean;
}) {
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
    .input("settings_json", args.settings ? JSON.stringify(args.settings) : null)
    .input("active", args.active ?? true)
    .query(`
      INSERT INTO dbo.bank_accounts (company_id, bank_code, name, agency, account, account_digit, convenio, wallet, settings_json, active)
      OUTPUT INSERTED.*
      VALUES (@company_id, @bank_code, @name, @agency, @account, @account_digit, @convenio, @wallet, @settings_json, @active)
    `);

  return r.recordset[0];
}

export async function updateBankAccount(args: {
  companyId: number;
  id: number;
  bankCode?: string;
  name?: string;
  agency?: string | null;
  account?: string | null;
  accountDigit?: string | null;
  convenio?: string | null;
  wallet?: string | null;
  settings?: any | null;
  active?: boolean;
}) {
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
    .input("settings_json", args.settings === undefined ? undefined : (args.settings ? JSON.stringify(args.settings) : null))
    .input("active", args.active ?? null)
    .query(`
      UPDATE dbo.bank_accounts
      SET
        bank_code = COALESCE(@bank_code, bank_code),
        name = COALESCE(@name, name),
        agency = COALESCE(@agency, agency),
        account = COALESCE(@account, account),
        account_digit = COALESCE(@account_digit, account_digit),
        convenio = COALESCE(@convenio, convenio),
        wallet = COALESCE(@wallet, wallet),
        settings_json = CASE WHEN @settings_json IS NULL OR @settings_json IS NOT NULL THEN @settings_json ELSE settings_json END,
        active = COALESCE(@active, active)
      OUTPUT INSERTED.*
      WHERE company_id=@company_id AND id=@id
    `);

  return r.recordset[0] ?? null;
}

export async function softDeleteBankAccount(companyId: number, id: number) {
  const pool = await getPool();
  const r = await pool.request().input("company_id", companyId).input("id", id).query(`
    UPDATE dbo.bank_accounts
    SET active = 0
    WHERE company_id=@company_id AND id=@id;

    SELECT @@ROWCOUNT as affected;
  `);
  return Number(r.recordset?.[0]?.affected ?? 0) > 0;
}
