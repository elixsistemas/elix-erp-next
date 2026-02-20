import sql from "mssql";
import { getPool } from "../../config/db";
import type { SupplierCreate, SupplierListQuery, SupplierUpdate } from "./suppliers.schema";

export type SupplierRow = {
  id: number;
  company_id: number;
  name: string;
  person_type: "PF" | "PJ" | null;
  document: string;
  ie: string | null;

  email: string | null;
  phone: string | null;
  mobile: string | null;
  contact_name: string | null;

  notes: string | null;

  is_active: boolean;
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

  created_at: string;
  updated_at: string | null;
};

function mapUniqueError(e: any) {
  const code = Number(e?.number ?? 0);
  // SQL Server unique violation
  if (code === 2601 || code === 2627) {
    return { error: "DOCUMENT_ALREADY_EXISTS" as const };
  }
  return null;
}

export async function listSuppliers(companyId: number, q: SupplierListQuery) {
  const pool = await getPool();
  const limit = Math.min(Number(q.limit ?? 50), 100);

  const where: string[] = ["company_id = @company_id"];
  const req = pool.request()
    .input("company_id", sql.Int, companyId)
    .input("limit", sql.Int, limit);

  if (typeof q.active === "number") {
    where.push("is_active = @active");
    req.input("active", sql.Bit, q.active ? 1 : 0);
  } else {
    // default: só ativos
    where.push("is_active = 1");
  }

  if (q.q?.trim()) {
    where.push("(name LIKE @q OR document LIKE @q OR email LIKE @q OR phone LIKE @q OR mobile LIKE @q)");
    req.input("q", sql.NVarChar(200), `%${q.q.trim()}%`);
  }

  const sqlText = `
    SELECT TOP (@limit)
      *
    FROM dbo.suppliers
    WHERE ${where.join(" AND ")}
    ORDER BY created_at DESC;
  `;

  const rs = await req.query<SupplierRow>(sqlText);
  return rs.recordset;
}

export async function getSupplier(companyId: number, id: number) {
  const pool = await getPool();
  const rs = await pool.request()
    .input("company_id", sql.Int, companyId)
    .input("id", sql.Int, id)
    .query<SupplierRow>(`
      SELECT TOP 1 *
      FROM dbo.suppliers
      WHERE company_id=@company_id AND id=@id;
    `);

  return rs.recordset[0] ?? null;
}

export async function createSupplier(companyId: number, args: SupplierCreate) {
  const pool = await getPool();

  try {
    const rs = await pool.request()
      .input("company_id", sql.Int, companyId)
      .input("name", sql.NVarChar(160), args.name)
      .input("person_type", sql.NVarChar(2), args.person_type ?? null)
      .input("document", sql.NVarChar(20), args.document)
      .input("ie", sql.NVarChar(30), args.ie ?? null)

      .input("email", sql.NVarChar(160), args.email ?? null)
      .input("phone", sql.NVarChar(40), args.phone ?? null)
      .input("mobile", sql.NVarChar(40), args.mobile ?? null)
      .input("contact_name", sql.NVarChar(160), args.contact_name ?? null)

      .input("notes", sql.NVarChar(sql.MAX), args.notes ?? null)

      .input("billing_address_line1", sql.NVarChar(120), args.billing_address_line1 ?? null)
      .input("billing_address_line2", sql.NVarChar(120), args.billing_address_line2 ?? null)
      .input("billing_district", sql.NVarChar(80), args.billing_district ?? null)
      .input("billing_city", sql.NVarChar(80), args.billing_city ?? null)
      .input("billing_state", sql.NVarChar(2), args.billing_state ?? null)
      .input("billing_zip_code", sql.NVarChar(12), args.billing_zip_code ?? null)
      .input("billing_country", sql.NVarChar(2), args.billing_country ?? "BR")

      .input("shipping_address_line1", sql.NVarChar(120), args.shipping_address_line1 ?? null)
      .input("shipping_address_line2", sql.NVarChar(120), args.shipping_address_line2 ?? null)
      .input("shipping_district", sql.NVarChar(80), args.shipping_district ?? null)
      .input("shipping_city", sql.NVarChar(80), args.shipping_city ?? null)
      .input("shipping_state", sql.NVarChar(2), args.shipping_state ?? null)
      .input("shipping_zip_code", sql.NVarChar(12), args.shipping_zip_code ?? null)
      .input("shipping_country", sql.NVarChar(2), args.shipping_country ?? "BR")
      .query<SupplierRow>(`
        INSERT INTO dbo.suppliers (
          company_id, name, person_type, document, ie,
          email, phone, mobile, contact_name, notes,
          is_active, created_at,
          billing_address_line1, billing_address_line2, billing_district, billing_city, billing_state, billing_zip_code, billing_country,
          shipping_address_line1, shipping_address_line2, shipping_district, shipping_city, shipping_state, shipping_zip_code, shipping_country
        )
        OUTPUT INSERTED.*
        VALUES (
          @company_id, @name, @person_type, @document, @ie,
          @email, @phone, @mobile, @contact_name, @notes,
          1, SYSUTCDATETIME(),
          @billing_address_line1, @billing_address_line2, @billing_district, @billing_city, @billing_state, @billing_zip_code, @billing_country,
          @shipping_address_line1, @shipping_address_line2, @shipping_district, @shipping_city, @shipping_state, @shipping_zip_code, @shipping_country
        );
      `);

    return { data: rs.recordset[0] };
  } catch (e: any) {
    const mapped = mapUniqueError(e);
    if (mapped) return mapped;
    throw e;
  }
}

export async function updateSupplier(companyId: number, id: number, args: SupplierUpdate) {
  const pool = await getPool();

  try {
    const rs = await pool.request()
      .input("company_id", sql.Int, companyId)
      .input("id", sql.Int, id)

      .input("name", sql.NVarChar(160), args.name ?? null)
      .input("person_type", sql.NVarChar(2), args.person_type ?? null)
      .input("document", sql.NVarChar(20), args.document ?? null)
      .input("ie", sql.NVarChar(30), args.ie ?? null)

      .input("email", sql.NVarChar(160), args.email ?? null)
      .input("phone", sql.NVarChar(40), args.phone ?? null)
      .input("mobile", sql.NVarChar(40), args.mobile ?? null)
      .input("contact_name", sql.NVarChar(160), args.contact_name ?? null)

      .input("notes", sql.NVarChar(sql.MAX), args.notes ?? null)

      .input("billing_address_line1", sql.NVarChar(120), args.billing_address_line1 ?? null)
      .input("billing_address_line2", sql.NVarChar(120), args.billing_address_line2 ?? null)
      .input("billing_district", sql.NVarChar(80), args.billing_district ?? null)
      .input("billing_city", sql.NVarChar(80), args.billing_city ?? null)
      .input("billing_state", sql.NVarChar(2), args.billing_state ?? null)
      .input("billing_zip_code", sql.NVarChar(12), args.billing_zip_code ?? null)
      .input("billing_country", sql.NVarChar(2), args.billing_country ?? null)

      .input("shipping_address_line1", sql.NVarChar(120), args.shipping_address_line1 ?? null)
      .input("shipping_address_line2", sql.NVarChar(120), args.shipping_address_line2 ?? null)
      .input("shipping_district", sql.NVarChar(80), args.shipping_district ?? null)
      .input("shipping_city", sql.NVarChar(80), args.shipping_city ?? null)
      .input("shipping_state", sql.NVarChar(2), args.shipping_state ?? null)
      .input("shipping_zip_code", sql.NVarChar(12), args.shipping_zip_code ?? null)
      .input("shipping_country", sql.NVarChar(2), args.shipping_country ?? null)
      .query<SupplierRow>(`
        UPDATE dbo.suppliers
        SET
          name = COALESCE(@name, name),
          person_type = COALESCE(@person_type, person_type),
          document = COALESCE(@document, document),
          ie = COALESCE(@ie, ie),

          email = COALESCE(@email, email),
          phone = COALESCE(@phone, phone),
          mobile = COALESCE(@mobile, mobile),
          contact_name = COALESCE(@contact_name, contact_name),

          notes = COALESCE(@notes, notes),

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
        WHERE company_id=@company_id AND id=@id AND (deleted_at IS NULL);
      `);

    const row = rs.recordset[0] ?? null;
    return { data: row };
  } catch (e: any) {
    const mapped = mapUniqueError(e);
    if (mapped) return mapped;
    throw e;
  }
}

export async function removeSupplier(companyId: number, id: number) {
  const pool = await getPool();
  const rs = await pool.request()
    .input("company_id", sql.Int, companyId)
    .input("id", sql.Int, id)
    .query(`
      UPDATE dbo.suppliers
      SET
        is_active = 0,
        deleted_at = SYSUTCDATETIME(),
        updated_at = SYSUTCDATETIME()
      WHERE company_id=@company_id AND id=@id AND deleted_at IS NULL;
      SELECT @@ROWCOUNT AS affected;
    `);

  const affected = (rs.recordset?.[0]?.affected ?? 0) as number;
  return affected > 0;
}
