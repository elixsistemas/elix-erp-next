import { getPool } from "../../config/db";
import sql from "mssql";
import type { CustomerCreate, CustomerUpdate, CustomerListQuery } from "./customers.schema";

export type Customer = {
  id: number;
  company_id: number;

  name: string;
  document: string;

  email: string | null;
  phone: string | null;

  person_type: "PF" | "PJ" | null;
  ie: string | null;
  mobile: string | null;
  contact_name: string | null;
  notes: string | null;

  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;

  billing_address_line1: string | null;
  billing_address_line2: string | null;
  billing_district: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_zip_code: string | null;
  billing_country: string | null;

  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
  shipping_district: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip_code: string | null;
  shipping_country: string | null;
};

export async function listCustomers(args: { companyId: number } & CustomerListQuery) {
  const pool = await getPool();
  const req = pool.request().input("company_id", sql.Int, args.companyId);

  const limit = args.limit ?? 50;
  req.input("limit", sql.Int, limit);

  // por padrão: só ativos (ótimo pro combobox)
  const activeFilter = typeof args.active === "number" ? args.active : 1;
  req.input("active", sql.Bit, activeFilter ? 1 : 0);

  let where = "WHERE company_id=@company_id AND is_active=@active";

  if (args.q) {
    req.input("q", sql.NVarChar(200), `%${args.q}%`);
    where += " AND (name LIKE @q OR document LIKE @q OR email LIKE @q)";
  }

  const r = await req.query(`
    SELECT TOP (@limit)
      id, company_id,
      name, document,
      email, phone,
      person_type, ie, mobile, contact_name, notes,
      is_active, created_at, updated_at, deleted_at,
      billing_address_line1, billing_address_line2, billing_district, billing_city, billing_state, billing_zip_code, billing_country,
      shipping_address_line1, shipping_address_line2, shipping_district, shipping_city, shipping_state, shipping_zip_code, shipping_country
    FROM dbo.customers
    ${where}
    ORDER BY name ASC, id DESC
  `);

  return r.recordset as Customer[];
}

export async function getCustomer(companyId: number, id: number): Promise<Customer | null> {
  const pool = await getPool();
  const r = await pool
    .request()
    .input("company_id", sql.Int, companyId)
    .input("id", sql.Int, id)
    .query(`
      SELECT
        id, company_id,
        name, document,
        email, phone,
        person_type, ie, mobile, contact_name, notes,
        is_active, created_at, updated_at, deleted_at,
        billing_address_line1, billing_address_line2, billing_district, billing_city, billing_state, billing_zip_code, billing_country,
        shipping_address_line1, shipping_address_line2, shipping_district, shipping_city, shipping_state, shipping_zip_code, shipping_country
      FROM dbo.customers
      WHERE company_id=@company_id AND id=@id
    `);

  return (r.recordset[0] as Customer) ?? null;
}

export async function createCustomer(
  companyId: number,
  data: CustomerCreate
): Promise<Customer | { error: "DOCUMENT_ALREADY_EXISTS" }> {
  const pool = await getPool();

  try {
    const r = await pool
      .request()
      .input("company_id", sql.Int, companyId)
      .input("name", sql.NVarChar(160), data.name)
      .input("document", sql.NVarChar(20), data.document)
      .input("email", sql.NVarChar(160), data.email ?? null)
      .input("phone", sql.NVarChar(40), data.phone ?? null)

      .input("person_type", sql.NVarChar(2), data.person_type ?? null)
      .input("ie", sql.NVarChar(30), data.ie ?? null)
      .input("mobile", sql.NVarChar(40), data.mobile ?? null)
      .input("contact_name", sql.NVarChar(120), data.contact_name ?? null)
      .input("notes", sql.NVarChar(2000), data.notes ?? null)
      .input("is_active", sql.Bit, data.is_active ?? true)

      .input("billing_address_line1", sql.NVarChar(120), data.billing_address_line1 ?? null)
      .input("billing_address_line2", sql.NVarChar(120), data.billing_address_line2 ?? null)
      .input("billing_district", sql.NVarChar(80), data.billing_district ?? null)
      .input("billing_city", sql.NVarChar(80), data.billing_city ?? null)
      .input("billing_state", sql.NVarChar(2), data.billing_state ?? null)
      .input("billing_zip_code", sql.NVarChar(12), data.billing_zip_code ?? null)
      .input("billing_country", sql.NVarChar(2), data.billing_country ?? null)

      .input("shipping_address_line1", sql.NVarChar(120), data.shipping_address_line1 ?? null)
      .input("shipping_address_line2", sql.NVarChar(120), data.shipping_address_line2 ?? null)
      .input("shipping_district", sql.NVarChar(80), data.shipping_district ?? null)
      .input("shipping_city", sql.NVarChar(80), data.shipping_city ?? null)
      .input("shipping_state", sql.NVarChar(2), data.shipping_state ?? null)
      .input("shipping_zip_code", sql.NVarChar(12), data.shipping_zip_code ?? null)
      .input("shipping_country", sql.NVarChar(2), data.shipping_country ?? null)
      .query(`
        INSERT INTO dbo.customers (
          company_id, name, document,
          email, phone,
          person_type, ie, mobile, contact_name, notes,
          is_active,
          created_at, updated_at,

          billing_address_line1, billing_address_line2, billing_district, billing_city, billing_state, billing_zip_code, billing_country,
          shipping_address_line1, shipping_address_line2, shipping_district, shipping_city, shipping_state, shipping_zip_code, shipping_country
        )
        OUTPUT INSERTED.*
        VALUES (
          @company_id, @name, @document,
          @email, @phone,
          @person_type, @ie, @mobile, @contact_name, @notes,
          @is_active,
          SYSUTCDATETIME(), SYSUTCDATETIME(),

          @billing_address_line1, @billing_address_line2, @billing_district, @billing_city, @billing_state, @billing_zip_code, @billing_country,
          @shipping_address_line1, @shipping_address_line2, @shipping_district, @shipping_city, @shipping_state, @shipping_zip_code, @shipping_country
        )
      `);

    return r.recordset[0] as Customer;
  } catch (e: any) {
    const msg = String(e?.message ?? "");
    if (e?.number === 2601 || e?.number === 2627) {
      if (msg.includes("UX_customers_company_document")) {
        return { error: "DOCUMENT_ALREADY_EXISTS" as const };
      }
    }
    throw e;
  }
}

export async function updateCustomer(
  companyId: number,
  id: number,
  data: CustomerUpdate
): Promise<Customer | { error: "DOCUMENT_ALREADY_EXISTS" } | null> {
  const pool = await getPool();

  try {
    const r = await pool
      .request()
      .input("company_id", sql.Int, companyId)
      .input("id", sql.Int, id)

      .input("name", sql.NVarChar(160), data.name ?? null)
      .input("document", sql.NVarChar(20), data.document ?? null)
      .input("email", sql.NVarChar(160), data.email ?? null)
      .input("phone", sql.NVarChar(40), data.phone ?? null)

      .input("person_type", sql.NVarChar(2), data.person_type ?? null)
      .input("ie", sql.NVarChar(30), data.ie ?? null)
      .input("mobile", sql.NVarChar(40), data.mobile ?? null)
      .input("contact_name", sql.NVarChar(120), data.contact_name ?? null)
      .input("notes", sql.NVarChar(2000), data.notes ?? null)
      .input("is_active", sql.Bit, typeof data.is_active === "boolean" ? data.is_active : null)

      .input("billing_address_line1", sql.NVarChar(120), data.billing_address_line1 ?? null)
      .input("billing_address_line2", sql.NVarChar(120), data.billing_address_line2 ?? null)
      .input("billing_district", sql.NVarChar(80), data.billing_district ?? null)
      .input("billing_city", sql.NVarChar(80), data.billing_city ?? null)
      .input("billing_state", sql.NVarChar(2), data.billing_state ?? null)
      .input("billing_zip_code", sql.NVarChar(12), data.billing_zip_code ?? null)
      .input("billing_country", sql.NVarChar(2), data.billing_country ?? null)

      .input("shipping_address_line1", sql.NVarChar(120), data.shipping_address_line1 ?? null)
      .input("shipping_address_line2", sql.NVarChar(120), data.shipping_address_line2 ?? null)
      .input("shipping_district", sql.NVarChar(80), data.shipping_district ?? null)
      .input("shipping_city", sql.NVarChar(80), data.shipping_city ?? null)
      .input("shipping_state", sql.NVarChar(2), data.shipping_state ?? null)
      .input("shipping_zip_code", sql.NVarChar(12), data.shipping_zip_code ?? null)
      .input("shipping_country", sql.NVarChar(2), data.shipping_country ?? null)
      .query(`
        UPDATE dbo.customers
        SET
          name = COALESCE(@name, name),
          document = COALESCE(@document, document),
          email = COALESCE(@email, email),
          phone = COALESCE(@phone, phone),

          person_type = COALESCE(@person_type, person_type),
          ie = COALESCE(@ie, ie),
          mobile = COALESCE(@mobile, mobile),
          contact_name = COALESCE(@contact_name, contact_name),
          notes = COALESCE(@notes, notes),
          is_active = COALESCE(@is_active, is_active),

          billing_address_line1 = COALESCE(@billing_address_line1, billing_address_line1),
          billing_address_line2 = COALESCE(@billing_address_line2, billing_address_line2),
          billing_district = COALESCE(@billing_district, billing_district),
          billing_city = COALESCE(@billing_city, billing_city),
          billing_state = COALESCE(@billing_state, billing_state),
          billing_zip_code = COALESCE(@billing_zip_code, billing_zip_code),
          billing_country = COALESCE(@billing_country, billing_country),

          shipping_address_line1 = COALESCE(@shipping_address_line1, shipping_address_line1),
          shipping_address_line2 = COALESCE(@shipping_address_line2, shipping_address_line2),
          shipping_district = COALESCE(@shipping_district, shipping_district),
          shipping_city = COALESCE(@shipping_city, shipping_city),
          shipping_state = COALESCE(@shipping_state, shipping_state),
          shipping_zip_code = COALESCE(@shipping_zip_code, shipping_zip_code),
          shipping_country = COALESCE(@shipping_country, shipping_country),

          updated_at = SYSUTCDATETIME()
        OUTPUT INSERTED.*
        WHERE id=@id AND company_id=@company_id
      `);

    return (r.recordset[0] as Customer) ?? null;
  } catch (e: any) {
    const msg = String(e?.message ?? "");
    if (e?.number === 2601 || e?.number === 2627) {
      if (msg.includes("UX_customers_company_document")) {
        return { error: "DOCUMENT_ALREADY_EXISTS" as const };
      }
    }
    throw e;
  }
}

export async function deleteCustomer(companyId: number, id: number): Promise<boolean> {
  const pool = await getPool();
  const r = await pool
    .request()
    .input("company_id", sql.Int, companyId)
    .input("id", sql.Int, id)
    .query(`
      UPDATE dbo.customers
      SET is_active = 0,
          deleted_at = SYSUTCDATETIME(),
          updated_at = SYSUTCDATETIME()
      WHERE id=@id AND company_id=@company_id AND is_active = 1
    `);

  return (r.rowsAffected?.[0] ?? 0) > 0;
}
