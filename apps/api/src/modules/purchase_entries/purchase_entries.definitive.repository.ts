import { getPool } from "../../config/db";

export type PurchaseEntryRow = {
  id: number;
  company_id: number;
  source_import_id: number | null;
  origin_type: "XML_IMPORT" | "MANUAL" | "PURCHASE_ORDER";
  purchase_order_id: number | null;
  supplier_id: number;
  carrier_id: number | null;
  carrier_vehicle_id: number | null;
  access_key: string | null;
  invoice_number: string | null;
  invoice_series: string | null;
  issue_date: string | null;
  entry_date: string;
  freight_mode: string | null;
  products_amount: number;
  freight_amount: number;
  insurance_amount: number;
  other_expenses_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_term_id: number | null;
  chart_account_id: number | null;
  cost_center_id: number | null;
  allocation_method: string;
  cost_policy: string;
  price_policy: string;
  markup_percent: number | null;
  margin_percent: number | null;
  accounts_payable_id: number | null;
  fiscal_document_id: number | null;
  status: "DRAFT" | "CONFIRMED" | "POSTED" | "CANCELED";
  notes: string | null;
  confirmed_at: string | null;
  confirmed_by_user_id: number | null;
  created_at: string;
  updated_at: string | null;
  supplier_name: string | null;
  supplier_document: string | null;
  carrier_name: string | null;
};

export type PurchaseEntryItemRow = {
  id: number;
  purchase_entry_id: number;
  company_id: number;
  source_import_item_id: number | null;
  line_no: number;
  product_id: number;
  supplier_code: string | null;
  ean: string | null;
  description_snapshot: string;
  ncm_snapshot: string | null;
  cest_snapshot: string | null;
  cfop_snapshot: string | null;
  uom_snapshot: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  freight_allocated: number;
  insurance_allocated: number;
  other_expenses_allocated: number;
  discount_allocated: number;
  landed_total_cost: number;
  landed_unit_cost: number;
  purchase_order_item_id: number | null;
  created_at: string;
  updated_at: string | null;
  product_name: string | null;
  sku: string | null;
};

export type PurchaseEntryDetails = {
  header: PurchaseEntryRow;
  items: PurchaseEntryItemRow[];
};

export async function getDefinitivePurchaseEntryIdByImportId(
  companyId: number,
  importId: number,
): Promise<number | null> {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("id", importId)
    .query<{ definitive_purchase_entry_id: number | null }>(`
      SELECT TOP 1 definitive_purchase_entry_id
      FROM dbo.purchase_entry_imports
      WHERE company_id = @company_id
        AND id = @id
    `);

  return result.recordset[0]?.definitive_purchase_entry_id ?? null;
}

export async function listDefinitiveEntries(
  companyId: number,
  query: import("./purchase_entries.schema").PurchaseEntryDefinitiveListQuery,
) {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("status", query.status ?? null)
    .input("supplier_id", query.supplierId ?? null)
    .input("date_from", query.from ?? null)
    .input("date_to", query.to ?? null)
    .input("q", query.q ? `%${query.q}%` : null)
    .input("limit", query.limit)
    .input("offset", query.offset)
    .query<PurchaseEntryRow>(`
      SELECT
        pe.id,
        pe.company_id,
        pe.source_import_id,
        pe.origin_type,
        pe.purchase_order_id,
        pe.supplier_id,
        pe.carrier_id,
        pe.carrier_vehicle_id,
        pe.access_key,
        pe.invoice_number,
        pe.invoice_series,
        CONVERT(varchar(23), pe.issue_date, 126) AS issue_date,
        CONVERT(varchar(23), pe.entry_date, 126) AS entry_date,
        pe.freight_mode,
        pe.products_amount,
        pe.freight_amount,
        pe.insurance_amount,
        pe.other_expenses_amount,
        pe.discount_amount,
        pe.total_amount,
        pe.payment_term_id,
        pe.chart_account_id,
        pe.cost_center_id,
        pe.allocation_method,
        pe.cost_policy,
        pe.price_policy,
        pe.markup_percent,
        pe.margin_percent,
        pe.accounts_payable_id,
        pe.fiscal_document_id,
        pe.status,
        pe.notes,
        CONVERT(varchar(23), pe.confirmed_at, 126) AS confirmed_at,
        pe.confirmed_by_user_id,
        CONVERT(varchar(23), pe.created_at, 126) AS created_at,
        CONVERT(varchar(23), pe.updated_at, 126) AS updated_at,
        s.name AS supplier_name,
        s.document AS supplier_document,
        COALESCE(c.trade_name, c.legal_name) AS carrier_name
      FROM dbo.purchase_entries pe
      INNER JOIN dbo.suppliers s
        ON s.id = pe.supplier_id
       AND s.company_id = pe.company_id
       AND s.deleted_at IS NULL
      LEFT JOIN dbo.carriers c
        ON c.id = pe.carrier_id
       AND c.company_id = pe.company_id
      WHERE pe.company_id = @company_id
        AND (@status IS NULL OR pe.status = @status)
        AND (@supplier_id IS NULL OR pe.supplier_id = @supplier_id)
        AND (@date_from IS NULL OR CONVERT(date, pe.entry_date) >= CONVERT(date, @date_from))
        AND (@date_to IS NULL OR CONVERT(date, pe.entry_date) <= CONVERT(date, @date_to))
        AND (
          @q IS NULL
          OR pe.invoice_number LIKE @q
          OR pe.access_key LIKE @q
          OR s.name LIKE @q
          OR s.document LIKE @q
        )
      ORDER BY pe.entry_date DESC, pe.id DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

  return result.recordset;
}

export async function getDefinitiveEntryById(
  companyId: number,
  id: number,
): Promise<PurchaseEntryDetails | null> {
  const pool = await getPool();

  const header = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query<PurchaseEntryRow>(`
      SELECT
        pe.id,
        pe.company_id,
        pe.source_import_id,
        pe.origin_type,
        pe.purchase_order_id,
        pe.supplier_id,
        pe.carrier_id,
        pe.carrier_vehicle_id,
        pe.access_key,
        pe.invoice_number,
        pe.invoice_series,
        CONVERT(varchar(23), pe.issue_date, 126) AS issue_date,
        CONVERT(varchar(23), pe.entry_date, 126) AS entry_date,
        pe.freight_mode,
        pe.products_amount,
        pe.freight_amount,
        pe.insurance_amount,
        pe.other_expenses_amount,
        pe.discount_amount,
        pe.total_amount,
        pe.payment_term_id,
        pe.chart_account_id,
        pe.cost_center_id,
        pe.allocation_method,
        pe.cost_policy,
        pe.price_policy,
        pe.markup_percent,
        pe.margin_percent,
        pe.accounts_payable_id,
        pe.fiscal_document_id,
        pe.status,
        pe.notes,
        CONVERT(varchar(23), pe.confirmed_at, 126) AS confirmed_at,
        pe.confirmed_by_user_id,
        CONVERT(varchar(23), pe.created_at, 126) AS created_at,
        CONVERT(varchar(23), pe.updated_at, 126) AS updated_at,
        s.name AS supplier_name,
        s.document AS supplier_document,
        COALESCE(c.trade_name, c.legal_name) AS carrier_name
      FROM dbo.purchase_entries pe
      INNER JOIN dbo.suppliers s
        ON s.id = pe.supplier_id
       AND s.company_id = pe.company_id
       AND s.deleted_at IS NULL
      LEFT JOIN dbo.carriers c
        ON c.id = pe.carrier_id
       AND c.company_id = pe.company_id
      WHERE pe.company_id = @company_id
        AND pe.id = @id
    `);

  if (!header.recordset[0]) return null;

  const items = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query<PurchaseEntryItemRow>(`
      SELECT
        pei.id,
        pei.purchase_entry_id,
        pei.company_id,
        pei.source_import_item_id,
        pei.line_no,
        pei.product_id,
        pei.supplier_code,
        pei.ean,
        pei.description_snapshot,
        pei.ncm_snapshot,
        pei.cest_snapshot,
        pei.cfop_snapshot,
        pei.uom_snapshot,
        pei.quantity,
        pei.unit_price,
        pei.total_price,
        pei.freight_allocated,
        pei.insurance_allocated,
        pei.other_expenses_allocated,
        pei.discount_allocated,
        pei.landed_total_cost,
        pei.landed_unit_cost,
        pei.purchase_order_item_id,
        CONVERT(varchar(23), pei.created_at, 126) AS created_at,
        CONVERT(varchar(23), pei.updated_at, 126) AS updated_at,
        p.name AS product_name,
        p.sku
      FROM dbo.purchase_entry_items pei
      INNER JOIN dbo.products p
        ON p.id = pei.product_id
       AND p.company_id = pei.company_id
      WHERE pei.company_id = @company_id
        AND pei.purchase_entry_id = @id
      ORDER BY pei.line_no
    `);

  return {
    header: header.recordset[0],
    items: items.recordset,
  };
}