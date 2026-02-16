import { getPool } from "../../config/db";

export async function createBankAccount(args: {
  companyId: number;
  bankCode: string;
  name: string;
  agency?: string | null;
  account?: string | null;
  accountDigit?: string | null;
  convenio?: string | null;
  wallet?: string | null;
  settingsJson?: string | null;
}) {
  const pool = await getPool();

  const r = await pool.request()
    .input("company_id", args.companyId)
    .input("bank_code", args.bankCode)
    .input("name", args.name)
    .input("agency", args.agency ?? null)
    .input("account", args.account ?? null)
    .input("account_digit", args.accountDigit ?? null)
    .input("convenio", args.convenio ?? null)
    .input("wallet", args.wallet ?? null)
    .input("settings_json", args.settingsJson ?? null)
    .query(`
      INSERT INTO dbo.bank_accounts
        (company_id, bank_code, name, agency, account, account_digit, convenio, wallet, settings_json)
      OUTPUT INSERTED.*
      VALUES
        (@company_id, @bank_code, @name, @agency, @account, @account_digit, @convenio, @wallet, @settings_json)
    `);

  return r.recordset[0];
}

export async function listBankAccounts(companyId: number) {
  const pool = await getPool();
  const r = await pool.request()
    .input("company_id", companyId)
    .query(`
      SELECT *
      FROM dbo.bank_accounts
      WHERE company_id=@company_id AND active=1
      ORDER BY id DESC
    `);

  return r.recordset;
}

export async function updateBankAccount(args: {
  companyId: number;
  id: number;
  name?: string;
  agency?: string | null;
  account?: string | null;
  accountDigit?: string | null;
  convenio?: string | null;
  wallet?: string | null;
  settingsJson?: string | null;
}) {
  const pool = await getPool();

  const r = await pool.request()
    .input("company_id", args.companyId)
    .input("id", args.id)
    .input("name", args.name ?? null)
    .input("agency", args.agency ?? null)
    .input("account", args.account ?? null)
    .input("account_digit", args.accountDigit ?? null)
    .input("convenio", args.convenio ?? null)
    .input("wallet", args.wallet ?? null)
    .input("settings_json", args.settingsJson ?? null)
    .query(`
      UPDATE dbo.bank_accounts
      SET
        name = COALESCE(@name, name),
        agency = @agency,
        account = @account,
        account_digit = @account_digit,
        convenio = @convenio,
        wallet = @wallet,
        settings_json = @settings_json
      OUTPUT INSERTED.*
      WHERE company_id=@company_id AND id=@id
    `);

  return r.recordset[0] ?? null;
}

export async function deactivateBankAccount(companyId: number, id: number) {
  const pool = await getPool();

  const r = await pool.request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      UPDATE dbo.bank_accounts
      SET active = 0
      OUTPUT INSERTED.id, INSERTED.active
      WHERE company_id=@company_id AND id=@id AND active=1
    `);

  return r.recordset[0] ?? null;
}

export async function activateBankAccount(companyId: number, id: number) {
  const pool = await getPool();

  const r = await pool.request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      UPDATE dbo.bank_accounts
      SET active = 1
      OUTPUT INSERTED.id, INSERTED.active
      WHERE company_id=@company_id AND id=@id AND active=0
    `);

  return r.recordset[0] ?? null;
}

