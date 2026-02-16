import { getPool } from "../../config/db";
import type { InventoryMovementCreate, InventoryMovementQuery, MovementType } from "./inventory.schema";

export type InventoryMovementRow = {
  id: number;
  company_id: number;
  product_id: number;
  type: MovementType;
  quantity: number;
  source: string | null;
  source_id: number | null;
  note: string | null;
  created_at: string;
};

export type InventoryStockRow = {
  product_id: number;
  on_hand: number;
};

export async function ensureProductBelongsToCompany(companyId: number, productId: number) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("product_id", productId)
    .query(`
      SELECT TOP 1 id
      FROM products
      WHERE company_id=@company_id AND id=@product_id
    `);

  return !!result.recordset[0];
}

/**
 * ✅ ÚNICO caminho de escrita
 * Grava movimento chamando a SP (transacional e com regra de estoque).
 */
export async function createMovement(companyId: number, data: InventoryMovementCreate): Promise<void> {
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
    .execute("dbo.sp_inventory_move");
}

/**
 * Lista de movimentos (paginada)
 */
export async function listMovements(companyId: number, query: InventoryMovementQuery): Promise<InventoryMovementRow[]> {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("companyId", companyId)
    .input("productId", query.productId ?? null)
    .input("type", query.type ?? null)
    .input("limit", query.limit)
    .input("offset", query.offset)
    .query<InventoryMovementRow>(`
      SELECT
        id,
        company_id,
        product_id,
        [type],
        quantity,
        source,
        source_id,
        note,
        created_at
      FROM dbo.inventory_movements
      WHERE company_id = @companyId
        AND (@productId IS NULL OR product_id = @productId)
        AND (@type IS NULL OR [type] = @type)
      ORDER BY created_at DESC, id DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

  return result.recordset;
}

/**
 * Saldo atual (derivado de movimentos).
 * ✅ Isso é o “inventory (estado atual)” de verdade.
 * Pode virar VIEW depois, sem mudar o código do controller.
 */
export async function getStock(companyId: number, productId: number): Promise<number> {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("product_id", productId)
    .query<{ on_hand: number }>(`
      SELECT COALESCE(SUM(
        CASE
          WHEN [type] IN ('IN','ADJUST_POS') THEN quantity
          WHEN [type] IN ('OUT','ADJUST_NEG') THEN -quantity
          ELSE 0
        END
      ), 0) AS on_hand
      FROM dbo.inventory_movements
      WHERE company_id = @company_id AND product_id = @product_id
    `);

  return Number(result.recordset[0]?.on_hand ?? 0);
}

/**
 * Saldo por produto (pra tela “Estoque atual”)
 */
export async function listStock(companyId: number): Promise<InventoryStockRow[]> {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("company_id", companyId)
    .query<InventoryStockRow>(`
      SELECT
        product_id,
        COALESCE(SUM(
          CASE
            WHEN [type] IN ('IN','ADJUST_POS') THEN quantity
            WHEN [type] IN ('OUT','ADJUST_NEG') THEN -quantity
            ELSE 0
          END
        ), 0) AS on_hand
      FROM dbo.inventory_movements
      WHERE company_id = @company_id
      GROUP BY product_id
      ORDER BY product_id
    `);

  return result.recordset;
}
