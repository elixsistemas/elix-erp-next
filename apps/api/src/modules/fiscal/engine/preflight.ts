import sql from "mssql";
import type { Transaction } from "mssql";

export type FiscalAlert = {
  code: "PRODUCT_NO_NCM" | "NCM_INVALID_OR_INACTIVE" | "TRACK_INV_MISMATCH";
  severity: "warn" | "block";
  message: string;
  saleItemId?: number;
  productId?: number;
};

export async function preflightFiscalTx(
  tx: Transaction,
  args: { companyId: number; saleId: number }
): Promise<{ alerts: FiscalAlert[] }> {
  const { companyId, saleId } = args;

  // Carrega itens com contexto fiscal mínimo
  const itemsRes = await new sql.Request(tx)
    .input("company_id", companyId)
    .input("sale_id", saleId)
    .query(`
      SELECT
        si.id AS sale_item_id,
        si.product_id,
        si.description,
        si.quantity,
        si.unit_price,
        si.total,
        p.kind,
        p.track_inventory,
        p.ncm_id,
        fn.active AS ncm_active
      FROM dbo.sale_items si
      JOIN dbo.sales s
        ON s.id = si.sale_id
       AND s.company_id = @company_id
      JOIN dbo.products p
        ON p.id = si.product_id
       AND p.company_id = s.company_id
      LEFT JOIN dbo.fiscal_ncm fn
        ON fn.id = p.ncm_id
      WHERE si.sale_id = @sale_id
    `);

  const items = itemsRes.recordset as any[];
  const alerts: FiscalAlert[] = [];

  for (const it of items) {
    if (it.kind === "product") {
      if (!it.ncm_id) {
        alerts.push({
          code: "PRODUCT_NO_NCM",
          severity: "block",
          message: `Produto sem NCM (obrigatório para NFe).`,
          saleItemId: Number(it.sale_item_id),
          productId: Number(it.product_id),
        });
      } else if (it.ncm_active !== true) {
        alerts.push({
          code: "NCM_INVALID_OR_INACTIVE",
          severity: "block",
          message: `NCM inválido/inativo para produto.`,
          saleItemId: Number(it.sale_item_id),
          productId: Number(it.product_id),
        });
      }

      // “futurista”: inconsistência operacional (não bloqueia emissão)
      if (it.track_inventory === false) {
        alerts.push({
          code: "TRACK_INV_MISMATCH",
          severity: "warn",
          message: `Produto físico com track_inventory=false (verificar cadastro).`,
          saleItemId: Number(it.sale_item_id),
          productId: Number(it.product_id),
        });
      }
    }
  }

  return { alerts };
}