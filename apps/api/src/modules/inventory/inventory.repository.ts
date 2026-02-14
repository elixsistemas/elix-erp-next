import { getPool } from "../../config/db";
import type { InventoryMovementCreate, InventoryMovementQuery } from "./inventory.schema";

export type InventoryMovement = {
  id: number;
  product_id: number;
  type: "IN" | "OUT" | "ADJUST";
  quantity: number;
  source: string;
  source_id: number | null;
  note: string | null;
  created_at: string;
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

export async function createMovement(companyId: number, data: InventoryMovementCreate): Promise<InventoryMovement> {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("product_id", data.productId)
    .input("type", data.type)
    .input("quantity", data.quantity)
    .input("source", data.source)
    .input("source_id", data.sourceId ?? null)
    .input("note", data.note ?? null)
    .query(`
      INSERT INTO inventory_movements (company_id, product_id, type, quantity, source, source_id, note)
      OUTPUT INSERTED.id, INSERTED.product_id, INSERTED.type, INSERTED.quantity,
             INSERTED.source, INSERTED.source_id, INSERTED.note, INSERTED.created_at
      VALUES (@company_id, @product_id, @type, @quantity, @source, @source_id, @note)
    `);

  return result.recordset[0] as InventoryMovement;
}

export async function listMovements(companyId: number, query: InventoryMovementQuery): Promise<InventoryMovement[]> {
  const pool = await getPool();

  // Filtro opcional por produto e tipo
  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("product_id", query.productId ?? null)
    .input("type", query.type ?? null)
    .input("limit", query.limit)
    .query(`
      SELECT TOP (@limit)
        id, product_id, type, quantity, source, source_id, note, created_at
      FROM inventory_movements
      WHERE company_id=@company_id
        AND (@product_id IS NULL OR product_id=@product_id)
        AND (@type IS NULL OR type=@type)
      ORDER BY created_at DESC, id DESC
    `);

  return result.recordset as InventoryMovement[];
}
