import { getPool } from "../../config/db";
import type {
  InventoryMovementCreate,
  InventoryMovementQuery,
  MovementType,
} from "./inventory.schema";

export type InventoryMovementRow = {
  id: number;
  company_id: number;
  product_id: number;
  type: MovementType;
  quantity: number;
  source: string | null;
  source_id: number | null;
  source_type: string | null;
  reason: string | null;
  idempotency_key: string | null;
  occurred_at: string | null;
  note: string | null;
  created_at: string;
};

export type InventoryStockRow = {
  product_id: number;
  name: string;
  sku: string | null;
  kind: string;
  uom: string | null;
  active: boolean;
  on_hand: number;
  last_movement_at: string | null;
};

export async function ensureProductBelongsToCompany(
  companyId: number,
  productId: number,
) {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("product_id", productId)
    .query(`
      SELECT TOP 1 id
      FROM products
      WHERE company_id = @company_id
        AND id = @product_id
    `);

  return !!result.recordset[0];
}

export async function createMovement(
  companyId: number,
  data: InventoryMovementCreate,
): Promise<void> {
  const pool = await getPool();

  await pool
    .request()
    .input("company_id", companyId)
    .input("product_id", data.productId)
    .input("type", data.type)
    .input("quantity", data.quantity)
    .input("source", data.source ?? null)
    .input("source_id", data.sourceId ?? null)
    .input("note", data.note ?? null)
    .input("source_type", data.sourceType ?? null)
    .input("reason", data.reason ?? null)
    .input("idempotency_key", data.idempotencyKey ?? null)
    .input("occurred_at", data.occurredAt ?? null)
    .execute("dbo.sp_inventory_move");
}

export async function listMovements(
  companyId: number,
  query: InventoryMovementQuery,
): Promise<InventoryMovementRow[]> {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("companyId", companyId)
    .input("productId", query.productId ?? null)
    .input("type", query.type ?? null)
    .input("reason", query.reason ?? null)
    .input("limit", query.limit)
    .input("offset", query.offset)
    .query(`
      SELECT
        id,
        company_id,
        product_id,
        [type],
        quantity,
        source,
        source_id,
        source_type,
        reason,
        idempotency_key,
        occurred_at,
        note,
        created_at
      FROM dbo.inventory_movements
      WHERE company_id = @companyId
        AND (@productId IS NULL OR product_id = @productId)
        AND (@type IS NULL OR [type] = @type)
        AND (@reason IS NULL OR reason = @reason)
      ORDER BY created_at DESC, id DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

  return result.recordset;
}

export async function getStock(
  companyId: number,
  productId: number,
): Promise<number> {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("product_id", productId)
    .query<{ on_hand: number }>(`
      SELECT CAST(stock AS decimal(18,4)) AS on_hand
      FROM dbo.v_product_stock
      WHERE company_id = @company_id
        AND product_id = @product_id
    `);

  return Number(result.recordset[0]?.on_hand ?? 0);
}

export async function listStock(
  companyId: number,
): Promise<InventoryStockRow[]> {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("company_id", companyId)
    .query(`
      SELECT
        product_id,
        name,
        sku,
        kind,
        uom,
        active,
        CAST(stock AS decimal(18,4)) AS on_hand,
        last_movement_at
      FROM dbo.v_product_stock
      WHERE company_id = @company_id
      ORDER BY name
    `);

  return result.recordset;
}

export async function getMovementByIdempotencyKey(
  companyId: number,
  key: string,
): Promise<InventoryMovementRow | null> {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("key", key)
    .query(`
      SELECT TOP 1
        id,
        company_id,
        product_id,
        [type],
        quantity,
        source,
        source_id,
        source_type,
        reason,
        idempotency_key,
        occurred_at,
        note,
        created_at
      FROM dbo.inventory_movements
      WHERE company_id = @company_id
        AND idempotency_key = @key
      ORDER BY id DESC
    `);

  return result.recordset[0] ?? null;
}