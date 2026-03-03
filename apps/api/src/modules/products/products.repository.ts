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

  ncm_id: number | null;
  uom_id: number;
  cest_id: number | null;

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

function cleanTextOrNull(v: any) {
  const s = String(v ?? "").trim();
  return s ? s : null;
}

function digitsOrNull(v: any, maxLen?: number) {
  const d = String(v ?? "").replace(/\D+/g, "").trim();
  if (!d) return null;
  return typeof maxLen === "number" ? d.slice(0, maxLen) : d;
}

function padSeq(n: number, size = 6) {
  return String(n).padStart(size, "0");
}

function buildSku(prefix: string, seq: number) {
  return `${prefix}-${padSeq(seq, 6)}`;
}

async function isSkuLocked(pool: any, companyId: number, productId: number) {
  const r = await pool.request()
    .input("company_id", companyId)
    .input("product_id", productId)
    .query(`
      SELECT
        CASE WHEN
          EXISTS (SELECT 1 FROM dbo.inventory_movements WHERE company_id=@company_id AND product_id=@product_id)
          OR EXISTS (SELECT 1 FROM dbo.sale_items          WHERE company_id=@company_id AND product_id=@product_id)
          OR EXISTS (SELECT 1 FROM dbo.order_items         WHERE company_id=@company_id AND product_id=@product_id)
          OR EXISTS (SELECT 1 FROM dbo.quote_items         WHERE company_id=@company_id AND product_id=@product_id)
        THEN 1 ELSE 0 END AS locked
    `);

  return Number(r.recordset?.[0]?.locked ?? 0) === 1;
}

// atomic + seguro contra concorrência
async function nextCompanySequence(companyId: number, key: string) {
  const pool = await getPool();

  await pool.request()
    .input("company_id", sql.Int, companyId)
    .input("sequence_key", sql.VarChar(60), key)
    .query(`
      IF NOT EXISTS (
        SELECT 1 FROM dbo.company_sequences
        WHERE company_id=@company_id AND sequence_key=@sequence_key
      )
      INSERT INTO dbo.company_sequences (company_id, sequence_key, next_value, updated_at)
      VALUES (@company_id, @sequence_key, 1, SYSUTCDATETIME());
    `);

  const r = await pool.request()
    .input("company_id", sql.Int, companyId)
    .input("sequence_key", sql.VarChar(60), key)
    .query(`
      UPDATE dbo.company_sequences
      SET next_value = next_value + 1,
          updated_at = SYSUTCDATETIME()
      OUTPUT INSERTED.next_value - 1 AS value
      WHERE company_id=@company_id AND sequence_key=@sequence_key;
    `);

  const value = Number(r.recordset?.[0]?.value ?? 0);
  if (!value) throw new Error("SEQUENCE_FAILED");
  return value;
}

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
      description, uom, uom_id,
      cest, cest_id, fiscal_json,
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
        description, uom, uom_id,
        cest, cest_id, fiscal_json,
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
    const kind = (data.kind ?? "product") as "product" | "service";

    // normaliza inputs
    const incomingSku = cleanTextOrNull(data.sku);
    const incomingEan = digitsOrNull(data.ean, 30); // EAN só dígitos
    const incomingUom = cleanTextOrNull(data.uom);

    // SKU auto somente para produto
    let finalSku = incomingSku;
    if (kind === "product" && !finalSku) {
      const seq = await nextCompanySequence(companyId, "PRODUCT_SKU");
      const prefix = "PRD"; // depois: prefixo configurável por empresa
      finalSku = buildSku(prefix, seq);
    }

    // resolve NCM code (mantém compat com data.ncm legado)
    let ncmCode: string | null = cleanTextOrNull((data as any).ncm);
    const ncmId: number | null =
      typeof (data as any).ncm_id === "number" ? Number((data as any).ncm_id) : null;

    if (ncmId) {
      const ncmRes = await pool.request()
        .input("ncm_id", sql.Int, ncmId)
        .query(`SELECT TOP 1 code FROM dbo.fiscal_ncm WHERE id=@ncm_id AND active=1`);
      ncmCode = (ncmRes.recordset[0]?.code as string) ?? null;
    }

    const r = await pool.request()
      .input("company_id", sql.Int, companyId)
      .input("name", sql.NVarChar(200), data.name)
      .input("sku", sql.NVarChar(60), finalSku)
      .input("ncm", sql.NVarChar(20), ncmCode)
      .input("ncm_id", sql.Int, ncmId)
      .input("ean", sql.NVarChar(30), incomingEan)
      .input("description", sql.NVarChar(2000), data.description ?? null)
      .input("uom", sql.NVarChar(10), incomingUom)
      .input("uom_id", sql.Int, (data as any).uom_id ?? 1) // se tiver default, ajuste aqui
      .input("cest", sql.NVarChar(20), data.cest ?? null)
      .input("cest_id", sql.Int, (data as any).cest_id ?? null)
      .input("fiscal_json", sql.NVarChar(sql.MAX), data.fiscal_json ?? null)
      .input("image_url", sql.NVarChar(500), data.image_url ?? null)
      .input("weight_kg", sql.Decimal(18, 3), data.weight_kg ?? null)
      .input("width_cm", sql.Decimal(18, 2), data.width_cm ?? null)
      .input("height_cm", sql.Decimal(18, 2), data.height_cm ?? null)
      .input("length_cm", sql.Decimal(18, 2), data.length_cm ?? null)
      .input("price", sql.Decimal(18, 2), data.price ?? 0)
      .input("cost", sql.Decimal(18, 2), data.cost ?? 0)
      .input("kind", sql.NVarChar(20), kind)
      .input("track_inventory", sql.Bit, kind === "service" ? 0 : (data.track_inventory ?? true) ? 1 : 0)
      .input("active", sql.Bit, (data.active ?? true) ? 1 : 0)
      .query(`
        INSERT INTO dbo.products (
          company_id, name, sku, ncm_id, ncm, ean,
          description, uom, uom_id,
          cest, cest_id, fiscal_json,
          image_url,
          weight_kg, width_cm, height_cm, length_cm,
          price, cost,
          kind, track_inventory,
          active, created_at, updated_at
        )
        OUTPUT INSERTED.*
        VALUES (
          @company_id, @name, @sku, @ncm_id, @ncm, @ean,
          @description, @uom, @uom_id,
          @cest, @cest_id, @fiscal_json,
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
): Promise<Product | { error: "SKU_ALREADY_EXISTS" | "EAN_ALREADY_EXISTS" | "SKU_LOCKED_AFTER_USAGE" } | null> {
  const pool = await getPool();

  try {

      // 1) pega sku atual (pra comparar)
    const cur = await pool.request()
      .input("company_id", sql.Int, companyId)
      .input("id", sql.Int, id)
      .query(`SELECT TOP 1 sku FROM dbo.products WHERE company_id=@company_id AND id=@id`);

    const currentSku: string | null = (cur.recordset?.[0]?.sku as string) ?? null;

    // 2) se o payload tentou mexer no SKU, valida trava
    const wantsSkuChange = Object.prototype.hasOwnProperty.call(data, "sku");
    if (wantsSkuChange) {
      const nextSku = (typeof data.sku === "string" ? data.sku.trim() : null) || null;

      const changed = (currentSku ?? null) !== (nextSku ?? null);
      if (changed) {
        const locked = await isSkuLocked(pool, companyId, id);
        if (locked) {
          return { error: "SKU_LOCKED_AFTER_USAGE" as const };
        }
      }
    }
    const kind = (data.kind ?? null) as ("product" | "service" | null);

    // flags de "veio no payload?"
    const hasNcmId = Object.prototype.hasOwnProperty.call(data as any, "ncm_id");

    // normaliza
    const sku = Object.prototype.hasOwnProperty.call(data as any, "sku")
      ? cleanTextOrNull((data as any).sku)
      : null;

    const ean = Object.prototype.hasOwnProperty.call(data as any, "ean")
      ? digitsOrNull((data as any).ean, 30)
      : null;

    // ncm_id vindo do front
    const ncmId: number | null =
      typeof (data as any).ncm_id === "number" ? Number((data as any).ncm_id) : null;

    // resolve ncmCode se veio ncm_id; senão usa ncm texto (legado) se veio
    let ncmCode: string | null = null;

    const hasNcmText = Object.prototype.hasOwnProperty.call(data as any, "ncm");
    if (hasNcmText) ncmCode = cleanTextOrNull((data as any).ncm);

    const hasSku = Object.prototype.hasOwnProperty.call(data, "sku");

    if (hasNcmId && ncmId) {
      const ncmRes = await pool.request()
        .input("ncm_id", sql.Int, ncmId)
        .query(`SELECT TOP 1 code FROM dbo.fiscal_ncm WHERE id=@ncm_id AND active=1`);
      ncmCode = (ncmRes.recordset[0]?.code as string) ?? null;
    }

    const r = await pool.request()
      .input("company_id", sql.Int, companyId)
      .input("id", sql.Int, id)
      .input("has_sku", sql.Bit, hasSku ? 1 : 0)

      .input("name", sql.NVarChar(200), (data as any).name ?? null)
      .input("sku", sql.NVarChar(60), typeof data.sku === "string" ? data.sku.trim() : null)
      .input("ncm", sql.NVarChar(20), ncmCode) 
      .input("ncm_id", sql.Int, ncmId)        
      .input("ean", sql.NVarChar(30), ean)

      .input("description", sql.NVarChar(2000), (data as any).description ?? null)
      .input("uom", sql.NVarChar(10), (data as any).uom ?? null)
      .input("uom_id", sql.Int, (data as any).uom_id ?? null)

      .input("cest", sql.NVarChar(20), (data as any).cest ?? null)
      .input("cest_id", sql.Int, (data as any).cest_id ?? null)
      .input("fiscal_json", sql.NVarChar(sql.MAX), (data as any).fiscal_json ?? null)

      .input("image_url", sql.NVarChar(500), (data as any).image_url ?? null)

      .input("weight_kg", sql.Decimal(18, 3), (data as any).weight_kg ?? null)
      .input("width_cm", sql.Decimal(18, 2), (data as any).width_cm ?? null)
      .input("height_cm", sql.Decimal(18, 2), (data as any).height_cm ?? null)
      .input("length_cm", sql.Decimal(18, 2), (data as any).length_cm ?? null)

      .input("price", sql.Decimal(18, 2), typeof (data as any).price === "number" ? (data as any).price : null)
      .input("cost", sql.Decimal(18, 2), typeof (data as any).cost === "number" ? (data as any).cost : null)

      .input("kind", sql.NVarChar(20), kind)
      .input("track_inventory", sql.Bit, typeof (data as any).track_inventory === "boolean" ? ((data as any).track_inventory ? 1 : 0) : null)
      .input("active", sql.Bit, typeof (data as any).active === "boolean" ? ((data as any).active ? 1 : 0) : null)
      .query(`
        UPDATE dbo.products
        SET
          name = COALESCE(@name, name),

          -- SKU/EAN só mudam se vierem no payload (COALESCE preserva)
          sku =
            CASE
              WHEN @has_sku = 1 THEN @sku
              ELSE sku
            END,
          ean = COALESCE(@ean, ean),

          ncm_id =
            CASE
              WHEN @has_ncm_id = 1 THEN @ncm_id
              ELSE ncm_id
            END,

          ncm = COALESCE(@ncm, ncm),

          description = COALESCE(@description, description),
          uom = COALESCE(@uom, uom),
          uom_id = COALESCE(@uom_id, uom_id),

          cest = COALESCE(@cest, cest),
          cest_id = COALESCE(@cest_id, cest_id),
          fiscal_json = COALESCE(@fiscal_json, fiscal_json),

          image_url = COALESCE(@image_url, image_url),

          weight_kg = COALESCE(@weight_kg, weight_kg),
          width_cm = COALESCE(@width_cm, width_cm),
          height_cm = COALESCE(@height_cm, height_cm),
          length_cm = COALESCE(@length_cm, length_cm),

          price = COALESCE(@price, price),
          cost = COALESCE(@cost, cost),

          kind = COALESCE(@kind, kind),

          track_inventory =
            CASE
              WHEN @kind = 'service' THEN 0
              ELSE COALESCE(@track_inventory, track_inventory)
            END,

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
