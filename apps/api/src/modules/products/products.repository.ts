import { getPool } from "../../config/db";
import sql from "mssql";
import type { ProductCreate, ProductUpdate, ProductListQuery } from "./products.schema";

export type Product = {
  id: number;
  company_id: number;

  name: string;
  sku: string | null;
  ncm: string | null;
  ean: string | null;

  description: string | null;
  uom: string | null;

  cest: string | null;
  fiscal_json: string | null;

  image_url: string | null;

  weight_kg: number | null;
  width_cm: number | null;
  height_cm: number | null;
  length_cm: number | null;

  price: number;
  cost: number;

  kind: "product" | "service";
  track_inventory: boolean;

  active: boolean;
  created_at: string;
  updated_at: string | null;
};

export async function listProducts(args: { companyId: number } & ProductListQuery): Promise<Product[]> {
  const pool = await getPool();
  const req = pool.request().input("company_id", sql.Int, args.companyId);

  const limit = args.limit ?? 50;
  req.input("limit", sql.Int, limit);

  let where = "WHERE company_id=@company_id";

  // active: se veio, filtra; se não veio, retorna só ativos por padrão (melhor p/ combobox)
  const activeFilter = typeof args.active === "number" ? args.active : 1;
  req.input("active", sql.Bit, activeFilter ? 1 : 0);
  where += " AND active=@active";

  if (args.kind) {
    req.input("kind", sql.NVarChar(20), args.kind);
    where += " AND kind=@kind";
  }

  if (args.q) {
    // busca por name/sku/ean
    req.input("q", sql.NVarChar(200), `%${args.q}%`);
    where += " AND (name LIKE @q OR sku LIKE @q OR ean LIKE @q)";
  }

  const r = await req.query(`
    SELECT TOP (@limit)
      id, company_id,
      name, sku, ncm, ncm_id, ean,
      description, uom,
      cest, fiscal_json,
      image_url,
      weight_kg, width_cm, height_cm, length_cm,
      price, cost,
      kind, track_inventory,
      active, created_at, updated_at
    FROM dbo.products
    ${where}
    ORDER BY name ASC, id DESC
  `);

  return r.recordset as Product[];
}

export async function getProduct(companyId: number, id: number): Promise<Product | null> {
  const pool = await getPool();
  const r = await pool
    .request()
    .input("company_id", sql.Int, companyId)
    .input("id", sql.Int, id)
    .query(`
      SELECT
        id, company_id,
        name, sku, ncm, ncm_id, ean,
        description, uom,
        cest, fiscal_json,
        image_url,
        weight_kg, width_cm, height_cm, length_cm,
        price, cost,
        kind, track_inventory,
        active, created_at, updated_at
      FROM dbo.products
      WHERE company_id=@company_id AND id=@id
    `);

  return (r.recordset[0] as Product) ?? null;
}

export async function createProduct(
  companyId: number,
  data: ProductCreate
): Promise<Product | { error: "SKU_ALREADY_EXISTS" | "EAN_ALREADY_EXISTS" }> {
  const pool = await getPool();

  try {
    // resolve NCM code (mantém compat com data.ncm legado)
    let ncmCode: string | null = data.ncm ?? null;
    const ncmId: number | null =
      typeof (data as any).ncmId === "number" ? (data as any).ncmId : null;

    if (ncmId) {
      const ncmRes = await pool.request()
        .input("ncm_id", sql.Int, ncmId)
        .query(`SELECT TOP 1 code FROM dbo.fiscal_ncm WHERE id=@ncm_id AND active=1`);
      ncmCode = (ncmRes.recordset[0]?.code as string) ?? null;
    }

    const r = await pool.request()
      .input("company_id", sql.Int, companyId)
      .input("name", sql.NVarChar(200), data.name)
      .input("sku", sql.NVarChar(60), data.sku ?? null)
      .input("ncm", sql.NVarChar(20), ncmCode)
      .input("ncm_id", sql.Int, ncmId) // ✅ novo
      .input("ean", sql.NVarChar(30), data.ean ?? null)
      .input("description", sql.NVarChar(2000), data.description ?? null)
      .input("uom", sql.NVarChar(10), data.uom ?? null)
      .input("cest", sql.NVarChar(20), data.cest ?? null)
      .input("fiscal_json", sql.NVarChar(sql.MAX), data.fiscal_json ?? null)
      .input("image_url", sql.NVarChar(500), data.image_url ?? null)
      .input("weight_kg", sql.Decimal(18, 3), data.weight_kg ?? null)
      .input("width_cm", sql.Decimal(18, 2), data.width_cm ?? null)
      .input("height_cm", sql.Decimal(18, 2), data.height_cm ?? null)
      .input("length_cm", sql.Decimal(18, 2), data.length_cm ?? null)
      .input("price", sql.Decimal(18, 2), data.price)
      .input("cost", sql.Decimal(18, 2), data.cost)
      .input("kind", sql.NVarChar(20), data.kind)
      .input("track_inventory", sql.Bit, data.track_inventory ?? true)
      .input("active", sql.Bit, data.active ?? true)
      .query(`
        INSERT INTO dbo.products (
          company_id, name, sku, ncm_id, ncm, ean,
          description, uom,
          cest, fiscal_json,
          image_url,
          weight_kg, width_cm, height_cm, length_cm,
          price, cost,
          kind, track_inventory,
          active, created_at, updated_at
        )
        OUTPUT INSERTED.*
        VALUES (
          @company_id, @name, @sku, @ncm_id, @ncm, @ean,
          @description, @uom,
          @cest, @fiscal_json,
          @image_url,
          @weight_kg, @width_cm, @height_cm, @length_cm,
          @price, @cost,
          @kind, @track_inventory,
          @active, SYSUTCDATETIME(), SYSUTCDATETIME()
        )
      `);

    return r.recordset[0] as Product;
  } catch (e: any) {
    const msg = String(e?.message ?? "");
    if (e?.number === 2601 || e?.number === 2627) {
      if (msg.includes("UX_products_company_sku")) return { error: "SKU_ALREADY_EXISTS" as const };
      if (msg.includes("UX_products_company_ean")) return { error: "EAN_ALREADY_EXISTS" as const };
    }
    throw e;
  }
}

export async function updateProduct(
  companyId: number,
  id: number,
  data: ProductUpdate
): Promise<Product | { error: "SKU_ALREADY_EXISTS" | "EAN_ALREADY_EXISTS" } | null> {
  const pool = await getPool();

  try {
    const ncmId =
      typeof (data as any).ncmId === "number" ? (data as any).ncmId : null;

    // resolve ncmCode se veio ncmId; senão usa data.ncm (legado)
    let ncmCode: string | null =
      typeof data.ncm === "string" ? data.ncm : null;

    if (ncmId) {
      const ncmRes = await pool.request()
        .input("ncm_id", sql.Int, ncmId)
        .query(`SELECT TOP 1 code FROM dbo.fiscal_ncm WHERE id=@ncm_id AND active=1`);
      ncmCode = (ncmRes.recordset[0]?.code as string) ?? null;
    }

    const r = await pool.request()
      .input("company_id", sql.Int, companyId)
      .input("id", sql.Int, id)

      .input("name", sql.NVarChar(200), data.name ?? null)
      .input("sku", sql.NVarChar(60), data.sku ?? null)
      .input("ncm", sql.NVarChar(20), ncmCode) // pode ser null
      .input("ncm_id", sql.Int, ncmId)         // pode ser null
      .input("ean", sql.NVarChar(30), data.ean ?? null)

      .input("description", sql.NVarChar(2000), data.description ?? null)
      .input("uom", sql.NVarChar(10), data.uom ?? null)

      .input("cest", sql.NVarChar(20), data.cest ?? null)
      .input("fiscal_json", sql.NVarChar(sql.MAX), data.fiscal_json ?? null)

      .input("image_url", sql.NVarChar(500), data.image_url ?? null)

      .input("weight_kg", sql.Decimal(18, 3), data.weight_kg ?? null)
      .input("width_cm", sql.Decimal(18, 2), data.width_cm ?? null)
      .input("height_cm", sql.Decimal(18, 2), data.height_cm ?? null)
      .input("length_cm", sql.Decimal(18, 2), data.length_cm ?? null)

      .input("price", sql.Decimal(18, 2), typeof data.price === "number" ? data.price : null)
      .input("cost", sql.Decimal(18, 2), typeof data.cost === "number" ? data.cost : null)

      .input("kind", sql.NVarChar(20), data.kind ?? null)
      .input("track_inventory", sql.Bit, typeof data.track_inventory === "boolean" ? data.track_inventory : null)
      .input("active", sql.Bit, typeof data.active === "boolean" ? data.active : null)
      .query(`
        UPDATE dbo.products
        SET
          name = COALESCE(@name, name),
          sku = COALESCE(@sku, sku),

          -- se veio ncmId, atualiza ncm_id; senão preserva
          ncm_id = COALESCE(@ncm_id, ncm_id),

          -- se veio ncmId ou ncm texto, atualiza ncm; senão preserva
          ncm = COALESCE(@ncm, ncm),

          ean = COALESCE(@ean, ean),

          description = COALESCE(@description, description),
          uom = COALESCE(@uom, uom),

          cest = COALESCE(@cest, cest),
          fiscal_json = COALESCE(@fiscal_json, fiscal_json),

          image_url = COALESCE(@image_url, image_url),

          weight_kg = COALESCE(@weight_kg, weight_kg),
          width_cm = COALESCE(@width_cm, width_cm),
          height_cm = COALESCE(@height_cm, height_cm),
          length_cm = COALESCE(@length_cm, length_cm),

          price = COALESCE(@price, price),
          cost = COALESCE(@cost, cost),

          kind = COALESCE(@kind, kind),
          track_inventory = COALESCE(@track_inventory, track_inventory),
          active = COALESCE(@active, active),

          updated_at = SYSUTCDATETIME()
        OUTPUT INSERTED.*
        WHERE company_id=@company_id AND id=@id
      `);

    return (r.recordset[0] as Product) ?? null;
  } catch (e: any) {
    const msg = String(e?.message ?? "");
    if (e?.number === 2601 || e?.number === 2627) {
      if (msg.includes("UX_products_company_sku")) return { error: "SKU_ALREADY_EXISTS" as const };
      if (msg.includes("UX_products_company_ean")) return { error: "EAN_ALREADY_EXISTS" as const };
    }
    throw e;
  }
}

export async function deactivateProduct(companyId: number, id: number): Promise<boolean> {
  const pool = await getPool();
  const r = await pool
    .request()
    .input("company_id", sql.Int, companyId)
    .input("id", sql.Int, id)
    .query(`
      UPDATE dbo.products
      SET active = 0, updated_at = SYSUTCDATETIME()
      WHERE company_id=@company_id AND id=@id
    `);

  return (r.rowsAffected?.[0] ?? 0) > 0;
}

export async function getProductStock(companyId: number, productId: number): Promise<number> {
  const pool = await getPool();
  const r = await pool
    .request()
    .input("company_id", sql.Int, companyId)
    .input("product_id", sql.Int, productId)
    .query(`
      SELECT stock
      FROM dbo.v_product_stock
      WHERE company_id=@company_id AND product_id=@product_id
    `);

  const row = r.recordset[0] as { stock?: number } | undefined;
  return row?.stock ?? 0;
}
