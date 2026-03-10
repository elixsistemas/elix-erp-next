import { getPool } from "../../config/db";
import type {
  ServiceCreate,
  ServiceListQuery,
  ServiceUpdate,
} from "./services.schema";

type ListArgs = {
  companyId: number;
} & ServiceListQuery;

export async function listServices(args: ListArgs) {
  const pool = await getPool();

  const req = pool.request().input("company_id", args.companyId);

  const where: string[] = [
    "company_id = @company_id",
    "kind = 'service'",
  ];

  if (args.q?.trim()) {
    req.input("q", `%${args.q.trim()}%`);
    where.push(`(name LIKE @q OR sku LIKE @q)`);
  }

  if (typeof args.active === "number") {
    req.input("active", args.active);
    where.push("active = @active");
  }

  req.input("limit", args.limit ?? 50);

  const r = await req.query(`
    SELECT TOP (@limit)
      id,
      company_id,
      name,
      sku,
      ncm,
      ean,
      price,
      cost,
      active,
      created_at,
      kind,
      description,
      uom,
      track_inventory,
      image_url,
      updated_at,
      weight_kg,
      width_cm,
      height_cm,
      length_cm,
      cest,
      fiscal_json,
      ncm_id,
      uom_id,
      cest_id
    FROM dbo.products
    WHERE ${where.join(" AND ")}
    ORDER BY active DESC, name ASC, id DESC
  `);

  return r.recordset;
}

export async function getService(companyId: number, id: number) {
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
        ncm,
        ean,
        price,
        cost,
        active,
        created_at,
        kind,
        description,
        uom,
        track_inventory,
        image_url,
        updated_at,
        weight_kg,
        width_cm,
        height_cm,
        length_cm,
        cest,
        fiscal_json,
        ncm_id,
        uom_id,
        cest_id
      FROM dbo.products
      WHERE company_id = @company_id
        AND id = @id
        AND kind = 'service'
    `);

  return r.recordset[0] ?? null;
}

export async function createService(companyId: number, data: ServiceCreate) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("name", data.name)
    .input("sku", data.sku ?? null)
    .input("price", data.price ?? 0)
    .input("cost", data.cost ?? 0)
    .input("active", typeof data.active === "boolean" ? data.active : true)
    .input("description", data.description ?? null)
    .input("uom", data.uom ?? "UN")
    .input("uom_id", data.uom_id ?? null)
    .input("image_url", data.image_url ?? null)
    .query(`
      INSERT INTO dbo.products (
        company_id,
        name,
        sku,
        price,
        cost,
        active,
        created_at,
        kind,
        description,
        uom,
        track_inventory,
        image_url,
        updated_at,
        ncm,
        ean,
        weight_kg,
        width_cm,
        height_cm,
        length_cm,
        cest,
        fiscal_json,
        ncm_id,
        uom_id,
        cest_id
      )
      OUTPUT inserted.*
      VALUES (
        @company_id,
        @name,
        @sku,
        @price,
        @cost,
        @active,
        SYSUTCDATETIME(),
        'service',
        @description,
        @uom,
        0,
        @image_url,
        SYSUTCDATETIME(),
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        @uom_id,
        NULL
      )
    `);

  return r.recordset[0] ?? null;
}

export async function updateService(
  companyId: number,
  id: number,
  data: ServiceUpdate,
) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .input("name", data.name ?? null)
    .input("sku", data.sku ?? null)
    .input("price", typeof data.price === "number" ? data.price : null)
    .input("cost", typeof data.cost === "number" ? data.cost : null)
    .input(
      "active",
      typeof data.active === "boolean" ? data.active : null,
    )
    .input("description", data.description ?? null)
    .input("uom", data.uom ?? null)
    .input("uom_id", data.uom_id ?? null)
    .input("image_url", data.image_url ?? null)
    .query(`
      UPDATE dbo.products
      SET
        name = COALESCE(@name, name),
        sku = COALESCE(@sku, sku),
        price = COALESCE(@price, price),
        cost = COALESCE(@cost, cost),
        active = COALESCE(@active, active),
        description = COALESCE(@description, description),
        uom = COALESCE(@uom, uom),
        uom_id = COALESCE(@uom_id, uom_id),
        image_url = COALESCE(@image_url, image_url),

        kind = 'service',
        track_inventory = 0,
        ncm = NULL,
        ean = NULL,
        weight_kg = NULL,
        width_cm = NULL,
        height_cm = NULL,
        length_cm = NULL,
        cest = NULL,
        fiscal_json = NULL,
        ncm_id = NULL,
        cest_id = NULL,

        updated_at = SYSUTCDATETIME()
      OUTPUT inserted.*
      WHERE company_id = @company_id
        AND id = @id
        AND kind = 'service'
    `);

  return r.recordset[0] ?? null;
}

export async function deactivateService(companyId: number, id: number) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      UPDATE dbo.products
      SET
        active = 0,
        updated_at = SYSUTCDATETIME()
      OUTPUT inserted.*
      WHERE company_id = @company_id
        AND id = @id
        AND kind = 'service'
    `);

  return r.recordset[0] ?? null;
}