import { getPool } from "../../config/db";
import sql from "mssql";
import type { CompanyCreate, CompanyUpdate } from "./companies.schema";

export type Company = {
  id: number;
  name: string;
  cnpj: string | null;
  created_at: string;
  allow_negative_stock: boolean;
  is_active: boolean;
  deleted_at: string | null;

  legal_name: string | null;
  trade_name: string | null;
  ie: string | null;
  im: string | null;

  email: string | null;
  phone: string | null;
  website: string | null;

  address_line1: string | null;
  address_line2: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;

  default_bank_account_id: number | null;
  updated_at: string | null;
};

export async function listCompanies(companyId: number): Promise<Company[]> {
  const pool = await getPool();
  const r = await pool.request()
    .input("id", sql.Int, companyId)
    .query(`
      SELECT
        id, name, cnpj, created_at, allow_negative_stock, is_active, deleted_at,
        legal_name, trade_name, ie, im,
        email, phone, website,
        address_line1, address_line2, district, city, state, zip_code, country,
        default_bank_account_id, updated_at
      FROM dbo.companies
      WHERE id=@id AND is_active=1 AND deleted_at IS NULL
    `);

  return r.recordset as Company[];
}

export async function getCompany(companyId: number): Promise<Company | null> {
  const rows = await listCompanies(companyId);
  return rows[0] ?? null;
}

export async function bankAccountBelongsToCompany(args: { companyId: number; bankAccountId: number }) {
  const pool = await getPool();
  const r = await pool.request()
    .input("company_id", sql.Int, args.companyId)
    .input("id", sql.Int, args.bankAccountId)
    .query(`
      SELECT TOP 1 id
      FROM dbo.bank_accounts
      WHERE company_id=@company_id AND id=@id AND active=1
    `);

  return !!r.recordset[0];
}

export async function createCompany(data: CompanyCreate): Promise<Company> {
  const pool = await getPool();
  const r = await pool.request()
    .input("name", sql.NVarChar(160), data.name)
    .input("cnpj", sql.NVarChar(20), data.cnpj ?? null)

    .input("legal_name", sql.NVarChar(160), data.legal_name ?? null)
    .input("trade_name", sql.NVarChar(160), data.trade_name ?? null)
    .input("ie", sql.NVarChar(30), data.ie ?? null)
    .input("im", sql.NVarChar(30), data.im ?? null)

    .input("email", sql.NVarChar(160), data.email ?? null)
    .input("phone", sql.NVarChar(40), data.phone ?? null)
    .input("website", sql.NVarChar(160), data.website ?? null)

    .input("address_line1", sql.NVarChar(120), data.address_line1 ?? null)
    .input("address_line2", sql.NVarChar(120), data.address_line2 ?? null)
    .input("district", sql.NVarChar(80), data.district ?? null)
    .input("city", sql.NVarChar(80), data.city ?? null)
    .input("state", sql.NVarChar(2), data.state ?? null)
    .input("zip_code", sql.NVarChar(12), data.zip_code ?? null)
    .input("country", sql.NVarChar(2), data.country ?? null)

    .input("default_bank_account_id", sql.Int, data.default_bank_account_id ?? null)

    .input("allow_negative_stock", sql.Bit, typeof data.allow_negative_stock === "boolean" ? data.allow_negative_stock : 0)
    .input("is_active", sql.Bit, typeof data.is_active === "boolean" ? data.is_active : 1)
    .query(`
      INSERT INTO dbo.companies (
        name, cnpj, created_at,
        allow_negative_stock, is_active,
        legal_name, trade_name, ie, im,
        email, phone, website,
        address_line1, address_line2, district, city, state, zip_code, country,
        default_bank_account_id,
        updated_at
      )
      OUTPUT INSERTED.*
      VALUES (
        @name, @cnpj, SYSUTCDATETIME(),
        @allow_negative_stock, @is_active,
        @legal_name, @trade_name, @ie, @im,
        @email, @phone, @website,
        @address_line1, @address_line2, @district, @city, @state, @zip_code, @country,
        @default_bank_account_id,
        SYSUTCDATETIME()
      )
    `);

  return r.recordset[0] as Company;
}

export async function updateCompany(companyId: number, data: CompanyUpdate): Promise<Company | null> {
  const pool = await getPool();

  const r = await pool.request()
    .input("id", sql.Int, companyId)

    .input("name", sql.NVarChar(160), data.name ?? null)
    .input("cnpj", sql.NVarChar(20), data.cnpj ?? null)

    .input("legal_name", sql.NVarChar(160), data.legal_name ?? null)
    .input("trade_name", sql.NVarChar(160), data.trade_name ?? null)
    .input("ie", sql.NVarChar(30), data.ie ?? null)
    .input("im", sql.NVarChar(30), data.im ?? null)

    .input("email", sql.NVarChar(160), data.email ?? null)
    .input("phone", sql.NVarChar(40), data.phone ?? null)
    .input("website", sql.NVarChar(160), data.website ?? null)

    .input("address_line1", sql.NVarChar(120), data.address_line1 ?? null)
    .input("address_line2", sql.NVarChar(120), data.address_line2 ?? null)
    .input("district", sql.NVarChar(80), data.district ?? null)
    .input("city", sql.NVarChar(80), data.city ?? null)
    .input("state", sql.NVarChar(2), data.state ?? null)
    .input("zip_code", sql.NVarChar(12), data.zip_code ?? null)
    .input("country", sql.NVarChar(2), data.country ?? null)

    .input("default_bank_account_id", sql.Int, data.default_bank_account_id ?? null)

    .input("allow_negative_stock", sql.Bit, typeof data.allow_negative_stock === "boolean" ? data.allow_negative_stock : null)
    .input("is_active", sql.Bit, typeof data.is_active === "boolean" ? data.is_active : null)
    .query(`
      UPDATE dbo.companies
      SET
        name = COALESCE(@name, name),
        cnpj = COALESCE(@cnpj, cnpj),

        legal_name = COALESCE(@legal_name, legal_name),
        trade_name = COALESCE(@trade_name, trade_name),
        ie = COALESCE(@ie, ie),
        im = COALESCE(@im, im),

        email = COALESCE(@email, email),
        phone = COALESCE(@phone, phone),
        website = COALESCE(@website, website),

        address_line1 = COALESCE(@address_line1, address_line1),
        address_line2 = COALESCE(@address_line2, address_line2),
        district = COALESCE(@district, district),
        city = COALESCE(@city, city),
        state = COALESCE(@state, state),
        zip_code = COALESCE(@zip_code, zip_code),
        country = COALESCE(@country, country),

        default_bank_account_id = COALESCE(@default_bank_account_id, default_bank_account_id),

        allow_negative_stock = COALESCE(@allow_negative_stock, allow_negative_stock),
        is_active = COALESCE(@is_active, is_active),

        updated_at = SYSUTCDATETIME()
      OUTPUT INSERTED.*
      WHERE id=@id AND deleted_at IS NULL
    `);

  return (r.recordset[0] as Company) ?? null;
}

export async function deleteCompany(id: number): Promise<boolean> {
  const pool = await getPool();
  const r = await pool.request()
    .input("id", sql.Int, id)
    .query(`
      UPDATE dbo.companies
      SET is_active = 0,
          deleted_at = SYSUTCDATETIME(),
          updated_at = SYSUTCDATETIME()
      WHERE id=@id AND is_active=1 AND deleted_at IS NULL
    `);

  return (r.rowsAffected?.[0] ?? 0) > 0;
}
