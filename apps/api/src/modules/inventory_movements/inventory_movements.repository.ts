import { getPool } from "../../config/db";

export type MovementType = "IN" | "OUT" | "ADJUST_POS" | "ADJUST_NEG";

export type MoveInput = {
  companyId: number;
  productId: number;
  type: MovementType;
  quantity: number;
  source?: string;
  sourceId?: number;
  note?: string;
};

export type InventoryMovementRow = {
  id: number;
  company_id: number;
  product_id: number;
  type: MovementType;
  quantity: number;
  source: string | null;
  source_id: number | null;
  note: string | null;
  created_at: Date;
};

export class InventoryMovementsRepository {
  async move(input: MoveInput): Promise<void> {
    const pool = await getPool();

    await pool
      .request()
      .input("company_id", input.companyId)
      .input("product_id", input.productId)
      .input("type", input.type)
      .input("quantity", input.quantity)
      .input("source", input.source ?? null)
      .input("source_id", input.sourceId ?? null)
      .input("note", input.note ?? null)
      .execute("dbo.sp_inventory_move");
  }

  async list(params: {
    companyId: number;
    productId?: number;
    limit: number;
    offset: number;
  }): Promise<InventoryMovementRow[]> {
    const pool = await getPool();

    const req = pool.request().input("companyId", params.companyId);

    let where = "WHERE company_id = @companyId";

    if (params.productId) {
      req.input("productId", params.productId);
      where += " AND product_id = @productId";
    }

    req.input("limit", params.limit);
    req.input("offset", params.offset);

    const result = await req.query<InventoryMovementRow>(`
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
      ${where}
      ORDER BY created_at DESC, id DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

    return result.recordset;
  }
}
