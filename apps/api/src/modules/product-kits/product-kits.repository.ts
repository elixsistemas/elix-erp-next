import { getPool } from "../../config/db";

export async function listKits(companyId: number, q?: string) {
  const pool = await getPool();
  const req = pool.request().input("company_id", companyId);

  let where = `p.company_id = @company_id AND p.kind = 'kit'`;

  if (q?.trim()) {
    req.input("q", `%${q.trim()}%`);
    where += ` AND (p.name LIKE @q OR p.sku LIKE @q)`;
  }

  const r = await req.query(`
    SELECT
      p.id,
      p.company_id,
      p.name,
      p.sku,
      p.kind,
      p.active,
      p.created_at,
      p.updated_at
    FROM dbo.products p
    WHERE ${where}
    ORDER BY p.name ASC
  `);

  return r.recordset;
}

export async function getKit(companyId: number, id: number) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      SELECT
        p.id,
        p.company_id,
        p.name,
        p.sku,
        p.kind,
        p.active,
        p.created_at,
        p.updated_at
      FROM dbo.products p
      WHERE p.company_id = @company_id
        AND p.id = @id
        AND p.kind = 'kit'
    `);

  return r.recordset[0] ?? null;
}

export async function getKitItems(companyId: number, kitProductId: number) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("kit_product_id", kitProductId)
    .query(`
      SELECT
        k.id,
        k.company_id,
        k.kit_product_id,
        k.component_product_id,
        k.quantity,
        k.sort_order,
        k.created_at,
        k.updated_at,

        p.name AS component_name,
        p.sku AS component_sku,
        p.kind AS component_kind,
        p.active AS component_active
      FROM dbo.product_kit_items k
      INNER JOIN dbo.products p
        ON p.id = k.component_product_id
       AND p.company_id = k.company_id
      WHERE k.company_id = @company_id
        AND k.kit_product_id = @kit_product_id
      ORDER BY k.sort_order ASC, p.name ASC
    `);

  return r.recordset;
}

export async function deleteKitItems(companyId: number, kitProductId: number) {
  const pool = await getPool();

  await pool
    .request()
    .input("company_id", companyId)
    .input("kit_product_id", kitProductId)
    .query(`
      DELETE FROM dbo.product_kit_items
      WHERE company_id = @company_id
        AND kit_product_id = @kit_product_id
    `);
}

export async function insertKitItems(
  companyId: number,
  kitProductId: number,
  items: Array<{
    componentProductId: number;
    quantity: number;
    sortOrder?: number;
  }>,
) {
  const pool = await getPool();

  for (const item of items) {
    await pool
      .request()
      .input("company_id", companyId)
      .input("kit_product_id", kitProductId)
      .input("component_product_id", item.componentProductId)
      .input("quantity", item.quantity)
      .input("sort_order", item.sortOrder ?? 0)
      .query(`
        INSERT INTO dbo.product_kit_items (
          company_id,
          kit_product_id,
          component_product_id,
          quantity,
          sort_order
        )
        VALUES (
          @company_id,
          @kit_product_id,
          @component_product_id,
          @quantity,
          @sort_order
        )
      `);
  }
}

export async function getProductById(companyId: number, id: number) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      SELECT
        id,
        company_id,
        name,
        sku,
        kind,
        active
      FROM dbo.products
      WHERE company_id = @company_id
        AND id = @id
    `);

  return r.recordset[0] ?? null;
}