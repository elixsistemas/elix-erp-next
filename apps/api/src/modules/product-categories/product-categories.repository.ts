import { getPool } from "../../config/db";

type ListArgs = {
  companyId: number;
  q?: string;
  active?: boolean;
  parentId?: number;
};

type CreateArgs = {
  companyId: number;
  parentId?: number | null;
  code: string;
  name: string;
  active?: boolean;
  sortOrder?: number;
};

type UpdateArgs = {
  companyId: number;
  id: number;
  parentId?: number | null;
  code?: string;
  name?: string;
  active?: boolean;
  sortOrder?: number;
};

export async function listProductCategories(args: ListArgs) {
  const pool = await getPool();
  const req = pool.request().input("company_id", args.companyId);

  const where: string[] = ["company_id=@company_id"];

  if (typeof args.active === "boolean") {
    req.input("active", args.active ? 1 : 0);
    where.push("active=@active");
  }

  if (typeof args.parentId === "number") {
    req.input("parent_id", args.parentId);
    where.push("parent_id=@parent_id");
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
      parent_id,
      code,
      name,
      active,
      sort_order,
      created_at,
      updated_at
    FROM dbo.product_categories
    WHERE ${where.join(" AND ")}
    ORDER BY sort_order ASC, code ASC, name ASC, id DESC
  `;

  const r = await req.query(sql);
  return r.recordset;
}

export async function listProductCategoriesTree(companyId: number) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .query(`
      SELECT
        id,
        company_id,
        parent_id,
        code,
        name,
        active,
        sort_order,
        created_at,
        updated_at
      FROM dbo.product_categories
      WHERE company_id=@company_id
      ORDER BY sort_order ASC, code ASC, name ASC, id DESC
    `);

  return r.recordset;
}

export async function getProductCategory(companyId: number, id: number) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      SELECT
        id,
        company_id,
        parent_id,
        code,
        name,
        active,
        sort_order,
        created_at,
        updated_at
      FROM dbo.product_categories
      WHERE company_id=@company_id
        AND id=@id
    `);

  return r.recordset[0] ?? null;
}

export async function createProductCategory(args: CreateArgs) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", args.companyId)
    .input("parent_id", args.parentId ?? null)
    .input("code", args.code)
    .input("name", args.name)
    .input("active", args.active ?? true ? 1 : 0)
    .input("sort_order", args.sortOrder ?? 0)
    .query(`
      INSERT INTO dbo.product_categories (
        company_id,
        parent_id,
        code,
        name,
        active,
        sort_order
      )
      OUTPUT INSERTED.*
      VALUES (
        @company_id,
        @parent_id,
        @code,
        @name,
        @active,
        @sort_order
      )
    `);

  return r.recordset[0] ?? null;
}

export async function updateProductCategory(args: UpdateArgs) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", args.companyId)
    .input("id", args.id)
    .input("parent_id", args.parentId === undefined ? undefined : (args.parentId ?? null))
    .input("code", args.code ?? null)
    .input("name", args.name ?? null)
    .input(
      "active",
      typeof args.active === "boolean" ? (args.active ? 1 : 0) : null,
    )
    .input(
      "sort_order",
      typeof args.sortOrder === "number" ? args.sortOrder : null,
    )
    .query(`
      UPDATE dbo.product_categories
      SET
        parent_id = COALESCE(@parent_id, parent_id),
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

export async function existsProductCategoryByCode(
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
    FROM dbo.product_categories
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

export async function countChildren(companyId: number, id: number) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      SELECT COUNT(*) AS total
      FROM dbo.product_categories
      WHERE company_id=@company_id
        AND parent_id=@id
    `);

  return Number(r.recordset[0]?.total ?? 0);
}

export async function isDescendantOf(
  companyId: number,
  categoryId: number,
  possibleParentId: number,
) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("category_id", categoryId)
    .input("possible_parent_id", possibleParentId)
    .query(`
      ;WITH tree AS (
        SELECT id, parent_id
        FROM dbo.product_categories
        WHERE company_id=@company_id
          AND id=@category_id

        UNION ALL

        SELECT c.id, c.parent_id
        FROM dbo.product_categories c
        INNER JOIN tree t
          ON c.parent_id = t.id
        WHERE c.company_id=@company_id
      )
      SELECT TOP 1 1 AS found
      FROM tree
      WHERE id=@possible_parent_id
    `);

  return !!r.recordset[0]?.found;
}

export async function removeProductCategory(companyId: number, id: number) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      DELETE FROM dbo.product_categories
      WHERE company_id=@company_id
        AND id=@id
    `);

  return r.rowsAffected[0] > 0;
}