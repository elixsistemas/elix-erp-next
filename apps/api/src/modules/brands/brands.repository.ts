import { getPool } from "../../config/db";

type ListArgs = {
  companyId: number;
  q?: string;
  active?: boolean;
};

type CreateArgs = {
  companyId: number;
  code: string;
  name: string;
  active?: boolean;
  sortOrder?: number;
};

type UpdateArgs = {
  companyId: number;
  id: number;
  code?: string;
  name?: string;
  active?: boolean;
  sortOrder?: number;
};

export async function listBrands(args: ListArgs) {
  const pool = await getPool();
  const req = pool.request().input("company_id", args.companyId);

  const where: string[] = ["company_id=@company_id"];

  if (typeof args.active === "boolean") {
    req.input("active", args.active ? 1 : 0);
    where.push("active=@active");
  }

  if (args.q?.trim()) {
    req.input("q", `%${args.q.trim()}%`);
    where.push(`
      (
        code LIKE @q
        OR name LIKE @q
      )
    `);
  }

  const sql = `
    SELECT
      id,
      company_id,
      code,
      name,
      active,
      sort_order,
      created_at,
      updated_at
    FROM dbo.brands
    WHERE ${where.join(" AND ")}
    ORDER BY active DESC, sort_order ASC, name ASC, id DESC
  `;

  const r = await req.query(sql);
  return r.recordset;
}

export async function getBrand(companyId: number, id: number) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      SELECT
        id,
        company_id,
        code,
        name,
        active,
        sort_order,
        created_at,
        updated_at
      FROM dbo.brands
      WHERE company_id=@company_id
        AND id=@id
    `);

  return r.recordset[0] ?? null;
}

export async function createBrand(args: CreateArgs) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", args.companyId)
    .input("code", args.code)
    .input("name", args.name)
    .input("active", args.active ?? true ? 1 : 0)
    .input("sort_order", args.sortOrder ?? 0)
    .query(`
      INSERT INTO dbo.brands (
        company_id,
        code,
        name,
        active,
        sort_order
      )
      OUTPUT INSERTED.*
      VALUES (
        @company_id,
        @code,
        @name,
        @active,
        @sort_order
      )
    `);

  return r.recordset[0] ?? null;
}

export async function updateBrand(args: UpdateArgs) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", args.companyId)
    .input("id", args.id)
    .input("code", args.code ?? null)
    .input("name", args.name ?? null)
    .input("active", typeof args.active === "boolean" ? (args.active ? 1 : 0) : null)
    .input("sort_order", typeof args.sortOrder === "number" ? args.sortOrder : null)
    .query(`
      UPDATE dbo.brands
      SET
        code = COALESCE(@code, code),
        name = COALESCE(@name, name),
        active = COALESCE(@active, active),
        sort_order = COALESCE(@sort_order, sort_order),
        updated_at = SYSUTCDATETIME()
      OUTPUT INSERTED.*
      WHERE company_id=@company_id
        AND id=@id
    `);

  return r.recordset[0] ?? null;
}

export async function existsBrandByCode(
  companyId: number,
  code: string,
  ignoreId?: number,
) {
  const pool = await getPool();

  const req = pool
    .request()
    .input("company_id", companyId)
    .input("code", code);

  let sql = `
    SELECT TOP 1 id
    FROM dbo.brands
    WHERE company_id=@company_id
      AND code=@code
  `;

  if (ignoreId) {
    req.input("ignore_id", ignoreId);
    sql += ` AND id <> @ignore_id`;
  }

  const r = await req.query(sql);
  return !!r.recordset[0];
}

export async function removeBrand(companyId: number, id: number) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      DELETE FROM dbo.brands
      WHERE company_id=@company_id
        AND id=@id
    `);

  return r.rowsAffected[0] > 0;
}