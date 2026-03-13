import type { Transaction } from "mssql";
import { createHash } from "node:crypto";
import { getPool } from "../../config/db";
import type {
  CreateProductFromImportItemInput,
  CreateSupplierFromImportInput,
  PurchaseEntryImportStatus,
  PurchaseEntryItemMatchStatus,
  PurchaseEntryListQuery,
  UpdateImportFinancialInput,
  UpdateImportInstallmentInput,
  UpdateImportItemInput,
  UpdateImportLogisticsInput,
} from "./purchase_entries.schema";

export type SupplierMini = {
  id: number;
  name: string;
  document?: string | null;
};

export type ProductMini = {
  id: number;
  name: string;
  sku?: string | null;
  ean?: string | null;
};

export type PurchaseEntryImportRow = {
  id: number;
  company_id: number;
  access_key: string;
  invoice_number: string | null;
  invoice_series: string | null;
  issue_date: string | null;

  supplier_document: string | null;
  supplier_name: string | null;
  supplier_ie: string | null;
  supplier_id: number | null;

  supplier_address_line1: string | null;
  supplier_address_line2: string | null;
  supplier_district: string | null;
  supplier_city: string | null;
  supplier_state: string | null;
  supplier_zip_code: string | null;
  supplier_country: string | null;

  chart_account_id: number | null;
  cost_center_id: number | null;
  payment_term_id: number | null;

  total_amount: number;
  products_amount: number;
  freight_amount: number;
  insurance_amount: number;
  other_expenses_amount: number;
  discount_amount: number;

  carrier_id: number | null;
  carrier_vehicle_id: number | null;
  freight_mode: string | null;
  carrier_name_xml: string | null;
  carrier_document_xml: string | null;
  carrier_ie_xml: string | null;

  allocation_method: "VALUE" | "QUANTITY" | "WEIGHT" | "MANUAL";
  cost_policy: "LAST_COST" | "AVERAGE_COST" | "LANDED_LAST_COST";
  price_policy: "NONE" | "MARKUP" | "MARGIN" | "SUGGESTED_ONLY";
  markup_percent: number | null;
  margin_percent: number | null;

  purchase_order_id: number | null;
  definitive_purchase_entry_id: number | null;

  source_file_name: string | null;

  status: PurchaseEntryImportStatus;
  match_summary: string | null;
  error_message: string | null;

  accounts_payable_id: number | null;
  fiscal_document_id: number | null;
  confirmed_at: string | null;
  confirmed_by_user_id: number | null;

  created_at: string;
  updated_at: string | null;
};

export type PurchaseEntryImportItemRow = {
  id: number;
  import_id: number;
  company_id: number;
  line_no: number;
  supplier_code: string | null;
  ean: string | null;
  description: string;
  ncm: string | null;
  cfop: string | null;
  uom: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_id: number | null;
  match_status: PurchaseEntryItemMatchStatus;
  match_notes: string | null;

  gross_unit_cost: number;
  freight_allocated: number;
  insurance_allocated: number;
  other_expenses_allocated: number;
  discount_allocated: number;
  landed_total_cost: number;
  landed_unit_cost: number;
  weight_kg: number | null;

  created_at: string;
  updated_at: string | null;
};

export type PurchaseEntryImportInstallmentRow = {
  id: number;
  import_id: number;
  company_id: number;
  line_no: number;
  installment_number: string | null;
  due_date: string;
  amount: number;
  accounts_payable_id: number | null;
  created_at: string;
  updated_at: string | null;
};

export type PurchaseEntryImportDetails = {
  header: PurchaseEntryImportRow;
  items: PurchaseEntryImportItemRow[];
  installments: PurchaseEntryImportInstallmentRow[];
};

export type ParsedImportData = {
  accessKey: string;
  invoiceNumber: string | null;
  invoiceSeries: string | null;
  issueDate: string | null;

  supplierDocument: string | null;
  supplierName: string | null;
  supplierIe: string | null;
  supplierId: number | null;

  supplierAddressLine1: string | null;
  supplierAddressLine2: string | null;
  supplierDistrict: string | null;
  supplierCity: string | null;
  supplierState: string | null;
  supplierZipCode: string | null;
  supplierCountry: string | null;

  chartAccountId: number | null;
  costCenterId: number | null;
  paymentTermId: number | null;

  totalAmount: number;
  productsAmount: number;
  freightAmount: number;
  insuranceAmount: number;
  otherExpensesAmount: number;
  discountAmount: number;

  carrierId: number | null;
  carrierVehicleId: number | null;
  freightMode: string | null;
  carrierNameXml: string | null;
  carrierDocumentXml: string | null;
  carrierIeXml: string | null;

  allocationMethod: "VALUE" | "QUANTITY" | "WEIGHT" | "MANUAL";
  costPolicy: "LAST_COST" | "AVERAGE_COST" | "LANDED_LAST_COST";
  pricePolicy: "NONE" | "MARKUP" | "MARGIN" | "SUGGESTED_ONLY";
  markupPercent: number | null;
  marginPercent: number | null;

  purchaseOrderId: number | null;

  fileName: string;
  xmlContent: string;
  matchSummary: string | null;
  status: PurchaseEntryImportStatus;

  items: Array<{
    lineNo: number;
    supplierCode: string | null;
    ean: string | null;
    description: string;
    ncm: string | null;
    cfop: string | null;
    uom: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productId: number | null;
    matchStatus: PurchaseEntryItemMatchStatus;
    matchNotes: string | null;

    grossUnitCost?: number;
    freightAllocated?: number;
    insuranceAllocated?: number;
    otherExpensesAllocated?: number;
    discountAllocated?: number;
    landedTotalCost?: number;
    landedUnitCost?: number;
    weightKg?: number | null;
  }>;

  installments: Array<{
    lineNo: number;
    installmentNumber: string | null;
    dueDate: string | null;
    amount: number;
  }>;
};

export type MiniOption = {
  id: number;
  name: string;
  code?: string | null;
};

type SqlExecutor = {
  request: Transaction["request"];
};

function onlyDigits(value: string | null | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

function clean(value: string | null | undefined, maxChars: number) {
  const v = (value ?? "").trim();
  if (!v) return null;
  return v.slice(0, maxChars);
}

function normalizeCountry(value: string | null | undefined) {
  const raw = (value ?? "").trim().toUpperCase();
  if (!raw) return "BR";
  if (raw === "BR" || raw === "BRA" || raw === "BRASIL" || raw === "BRAZIL") {
    return "BR";
  }
  return raw.slice(0, 2);
}

export function hashXml(xmlContent: string) {
  return createHash("sha256").update(xmlContent, "utf8").digest("hex");
}

export async function listChartAccountsMini(companyId: number): Promise<MiniOption[]> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("company_id", companyId)
    .query<MiniOption>(`
      SELECT id, name, code
      FROM dbo.chart_of_accounts
      WHERE company_id = @company_id
        AND active = 1
      ORDER BY code, name
    `);

  return result.recordset;
}

export async function listCostCentersMini(companyId: number): Promise<MiniOption[]> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("company_id", companyId)
    .query<MiniOption>(`
      SELECT id, name, code
      FROM dbo.cost_centers
      WHERE company_id = @company_id
        AND active = 1
      ORDER BY code, name
    `);

  return result.recordset;
}

export async function listPaymentTermsMini(companyId: number): Promise<MiniOption[]> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("company_id", companyId)
    .query<MiniOption>(`
      SELECT id, name
      FROM dbo.payment_terms
      WHERE company_id = @company_id
        AND active = 1
      ORDER BY name
    `);

  return result.recordset;
}

export async function getCompanyDocument(companyId: number): Promise<string | null> {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("company_id", companyId)
    .query<{ cnpj: string | null }>(`
      SELECT TOP 1
        cnpj
      FROM dbo.companies
      WHERE id = @company_id
        AND deleted_at IS NULL
    `);

  return result.recordset[0]?.cnpj ?? null;
}

export async function findSupplierByDocument(companyId: number, document: string | null) {
  if (!document) return null;

  const normalized = onlyDigits(document);
  if (!normalized) return null;

  const pool = await getPool();
  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("document", normalized)
    .query<{ id: number }>(`
      SELECT TOP 1 id
      FROM dbo.suppliers
      WHERE company_id = @company_id
        AND REPLACE(REPLACE(REPLACE(document, '.', ''), '/', ''), '-', '') = @document
        AND deleted_at IS NULL
      ORDER BY id
    `);

  return result.recordset[0]?.id ?? null;
}

export async function findProductMatch(
  companyId: number,
  input: { ean: string | null; supplierCode: string | null; description: string },
) {
  const pool = await getPool();

  const normalizedEan = onlyDigits(input.ean);
  const normalizedDescription = input.description.trim();

  if (normalizedEan) {
    const byEan = await pool
      .request()
      .input("company_id", companyId)
      .input("ean", normalizedEan)
      .query<{ id: number }>(`
        SELECT TOP 1 id
        FROM dbo.products
        WHERE company_id = @company_id
          AND REPLACE(REPLACE(REPLACE(ISNULL(ean, ''), '.', ''), '/', ''), '-', '') = @ean
        ORDER BY id
      `);

    if (byEan.recordset[0]?.id) {
      return {
        productId: byEan.recordset[0].id,
        matchStatus: "MATCHED" as const,
        matchNotes: "Match automático por EAN",
      };
    }
  }

  if (normalizedDescription) {
    const byName = await pool
      .request()
      .input("company_id", companyId)
      .input("name", normalizedDescription.toUpperCase())
      .query<{ id: number }>(`
        SELECT TOP 1 id
        FROM dbo.products
        WHERE company_id = @company_id
          AND UPPER(LTRIM(RTRIM(name))) = @name
        ORDER BY id
      `);

    if (byName.recordset[0]?.id) {
      return {
        productId: byName.recordset[0].id,
        matchStatus: "MATCHED" as const,
        matchNotes: "Match automático por nome exato",
      };
    }
  }

  return {
    productId: null,
    matchStatus: "REVIEW" as const,
    matchNotes: "Produto pendente de revisão",
  };
}

export async function existsImportByAccessKey(companyId: number, accessKey: string) {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("access_key", accessKey)
    .query<{ id: number }>(`
      SELECT TOP 1 id
      FROM dbo.purchase_entry_imports
      WHERE company_id = @company_id
        AND access_key = @access_key
      ORDER BY id DESC
    `);

  return result.recordset[0]?.id ?? null;
}

export async function createImport(companyId: number, data: ParsedImportData) {
  const pool = await getPool();
  const tx = pool.transaction();

  await tx.begin();

  try {
    const headerResult = await tx
      .request()
      .input("company_id", companyId)
      .input("access_key", data.accessKey)
      .input("invoice_number", data.invoiceNumber)
      .input("invoice_series", data.invoiceSeries)
      .input("issue_date", data.issueDate)
      .input("supplier_document", data.supplierDocument)
      .input("supplier_name", data.supplierName)
      .input("supplier_ie", data.supplierIe)
      .input("supplier_id", data.supplierId)
      .input("supplier_address_line1", data.supplierAddressLine1)
      .input("supplier_address_line2", data.supplierAddressLine2)
      .input("supplier_district", data.supplierDistrict)
      .input("supplier_city", data.supplierCity)
      .input("supplier_state", data.supplierState)
      .input("supplier_zip_code", data.supplierZipCode)
      .input("supplier_country", data.supplierCountry)
      .input("chart_account_id", data.chartAccountId)
      .input("cost_center_id", data.costCenterId)
      .input("payment_term_id", data.paymentTermId)
      .input("total_amount", data.totalAmount)
      .input("products_amount", data.productsAmount)
      .input("freight_amount", data.freightAmount)
      .input("insurance_amount", data.insuranceAmount ?? 0)
      .input("other_expenses_amount", data.otherExpensesAmount ?? 0)
      .input("discount_amount", data.discountAmount)
      .input("carrier_id", data.carrierId ?? null)
      .input("carrier_vehicle_id", data.carrierVehicleId ?? null)
      .input("freight_mode", data.freightMode ?? null)
      .input("carrier_name_xml", data.carrierNameXml ?? null)
      .input("carrier_document_xml", data.carrierDocumentXml ?? null)
      .input("carrier_ie_xml", data.carrierIeXml ?? null)
      .input("allocation_method", data.allocationMethod ?? "VALUE")
      .input("cost_policy", data.costPolicy ?? "LANDED_LAST_COST")
      .input("price_policy", data.pricePolicy ?? "NONE")
      .input("markup_percent", data.markupPercent ?? null)
      .input("margin_percent", data.marginPercent ?? null)
      .input("purchase_order_id", data.purchaseOrderId ?? null)
      .input("xml_content", data.xmlContent)
      .input("xml_hash", hashXml(data.xmlContent))
      .input("source_file_name", data.fileName)
      .input("status", data.status)
      .input("match_summary", data.matchSummary)
      .query<{ id: number }>(`
        INSERT INTO dbo.purchase_entry_imports (
          company_id,
          access_key,
          invoice_number,
          invoice_series,
          issue_date,
          supplier_document,
          supplier_name,
          supplier_ie,
          supplier_id,
          supplier_address_line1,
          supplier_address_line2,
          supplier_district,
          supplier_city,
          supplier_state,
          supplier_zip_code,
          supplier_country,
          chart_account_id,
          cost_center_id,
          payment_term_id,
          total_amount,
          products_amount,
          freight_amount,
          insurance_amount,
          other_expenses_amount,
          discount_amount,
          carrier_id,
          carrier_vehicle_id,
          freight_mode,
          carrier_name_xml,
          carrier_document_xml,
          carrier_ie_xml,
          allocation_method,
          cost_policy,
          price_policy,
          markup_percent,
          margin_percent,
          purchase_order_id,
          xml_content,
          xml_hash,
          source_file_name,
          status,
          match_summary
        )
        OUTPUT INSERTED.id
        VALUES (
          @company_id,
          @access_key,
          @invoice_number,
          @invoice_series,
          @issue_date,
          @supplier_document,
          @supplier_name,
          @supplier_ie,
          @supplier_id,
          @supplier_address_line1,
          @supplier_address_line2,
          @supplier_district,
          @supplier_city,
          @supplier_state,
          @supplier_zip_code,
          @supplier_country,
          @chart_account_id,
          @cost_center_id,
          @payment_term_id,
          @total_amount,
          @products_amount,
          @freight_amount,
          @insurance_amount,
          @other_expenses_amount,
          @discount_amount,
          @carrier_id,
          @carrier_vehicle_id,
          @freight_mode,
          @carrier_name_xml,
          @carrier_document_xml,
          @carrier_ie_xml,
          @allocation_method,
          @cost_policy,
          @price_policy,
          @markup_percent,
          @margin_percent,
          @purchase_order_id,
          @xml_content,
          @xml_hash,
          @source_file_name,
          @status,
          @match_summary
        )
      `);

    const importId = Number(headerResult.recordset[0].id);

    for (const item of data.items) {
      await tx
        .request()
        .input("import_id", importId)
        .input("company_id", companyId)
        .input("line_no", item.lineNo)
        .input("supplier_code", item.supplierCode)
        .input("ean", item.ean)
        .input("description", item.description)
        .input("ncm", item.ncm)
        .input("cfop", item.cfop)
        .input("uom", item.uom)
        .input("quantity", item.quantity)
        .input("unit_price", item.unitPrice)
        .input("total_price", item.totalPrice)
        .input("product_id", item.productId)
        .input("match_status", item.matchStatus)
        .input("match_notes", item.matchNotes)
        .input("gross_unit_cost", item.grossUnitCost ?? item.unitPrice)
        .input("freight_allocated", item.freightAllocated ?? 0)
        .input("insurance_allocated", item.insuranceAllocated ?? 0)
        .input("other_expenses_allocated", item.otherExpensesAllocated ?? 0)
        .input("discount_allocated", item.discountAllocated ?? 0)
        .input("landed_total_cost", item.landedTotalCost ?? item.totalPrice)
        .input("landed_unit_cost", item.landedUnitCost ?? item.unitPrice)
        .input("weight_kg", item.weightKg ?? null)
        .query(`
          INSERT INTO dbo.purchase_entry_import_items (
            import_id,
            company_id,
            line_no,
            supplier_code,
            ean,
            description,
            ncm,
            cfop,
            uom,
            quantity,
            unit_price,
            total_price,
            product_id,
            match_status,
            match_notes,
            gross_unit_cost,
            freight_allocated,
            insurance_allocated,
            other_expenses_allocated,
            discount_allocated,
            landed_total_cost,
            landed_unit_cost,
            weight_kg
          )
          VALUES (
            @import_id,
            @company_id,
            @line_no,
            @supplier_code,
            @ean,
            @description,
            @ncm,
            @cfop,
            @uom,
            @quantity,
            @unit_price,
            @total_price,
            @product_id,
            @match_status,
            @match_notes,
            @gross_unit_cost,
            @freight_allocated,
            @insurance_allocated,
            @other_expenses_allocated,
            @discount_allocated,
            @landed_total_cost,
            @landed_unit_cost,
            @weight_kg
          )
        `);
    }

    for (const inst of data.installments) {
      if (!inst.dueDate || !inst.amount) continue;

      await tx
        .request()
        .input("import_id", importId)
        .input("company_id", companyId)
        .input("line_no", inst.lineNo)
        .input("installment_number", inst.installmentNumber)
        .input("due_date", inst.dueDate)
        .input("amount", inst.amount)
        .query(`
          INSERT INTO dbo.purchase_entry_import_installments (
            import_id,
            company_id,
            line_no,
            installment_number,
            due_date,
            amount
          )
          VALUES (
            @import_id,
            @company_id,
            @line_no,
            @installment_number,
            @due_date,
            @amount
          )
        `);
    }

    await tx.commit();
    return importId;
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

export async function listImports(companyId: number, query: PurchaseEntryListQuery) {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("status", query.status ?? null)
    .input("supplier_id", query.supplierId ?? null)
    .input("q", query.q ? `%${query.q}%` : null)
    .input("limit", query.limit)
    .input("offset", query.offset)
    .query<PurchaseEntryImportRow>(`
      SELECT
        id,
        company_id,
        access_key,
        invoice_number,
        invoice_series,
        issue_date,
        supplier_document,
        supplier_name,
        supplier_ie,
        supplier_id,
        supplier_address_line1,
        supplier_address_line2,
        supplier_district,
        supplier_city,
        supplier_state,
        supplier_zip_code,
        supplier_country,
        chart_account_id,
        cost_center_id,
        payment_term_id,
        total_amount,
        products_amount,
        freight_amount,
        insurance_amount,
        other_expenses_amount,
        discount_amount,
        carrier_id,
        carrier_vehicle_id,
        freight_mode,
        carrier_name_xml,
        carrier_document_xml,
        carrier_ie_xml,
        allocation_method,
        cost_policy,
        price_policy,
        markup_percent,
        margin_percent,
        purchase_order_id,
        definitive_purchase_entry_id,
        source_file_name,
        status,
        match_summary,
        error_message,
        accounts_payable_id,
        fiscal_document_id,
        confirmed_at,
        confirmed_by_user_id,
        created_at,
        updated_at
      FROM dbo.purchase_entry_imports
      WHERE company_id = @company_id
        AND (@status IS NULL OR status = @status)
        AND (@supplier_id IS NULL OR supplier_id = @supplier_id)
        AND (
          @q IS NULL
          OR access_key LIKE @q
          OR supplier_name LIKE @q
          OR invoice_number LIKE @q
        )
      ORDER BY id DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

  return result.recordset;
}

export async function getImportById(
  companyId: number,
  id: number,
): Promise<PurchaseEntryImportDetails | null> {
  const pool = await getPool();

  const header = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query<PurchaseEntryImportRow>(`
      SELECT
        id,
        company_id,
        access_key,
        invoice_number,
        invoice_series,
        issue_date,
        supplier_document,
        supplier_name,
        supplier_ie,
        supplier_id,
        supplier_address_line1,
        supplier_address_line2,
        supplier_district,
        supplier_city,
        supplier_state,
        supplier_zip_code,
        supplier_country,
        chart_account_id,
        cost_center_id,
        payment_term_id,
        total_amount,
        products_amount,
        freight_amount,
        insurance_amount,
        other_expenses_amount,
        discount_amount,
        carrier_id,
        carrier_vehicle_id,
        freight_mode,
        carrier_name_xml,
        carrier_document_xml,
        carrier_ie_xml,
        allocation_method,
        cost_policy,
        price_policy,
        markup_percent,
        margin_percent,
        purchase_order_id,
        definitive_purchase_entry_id,
        source_file_name,
        status,
        match_summary,
        error_message,
        accounts_payable_id,
        fiscal_document_id,
        confirmed_at,
        confirmed_by_user_id,
        created_at,
        updated_at
      FROM dbo.purchase_entry_imports
      WHERE company_id = @company_id
        AND id = @id
    `);

  if (!header.recordset[0]) return null;

  const items = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query<PurchaseEntryImportItemRow>(`
      SELECT
        id,
        import_id,
        company_id,
        line_no,
        supplier_code,
        ean,
        description,
        ncm,
        cfop,
        uom,
        quantity,
        unit_price,
        total_price,
        product_id,
        match_status,
        match_notes,
        gross_unit_cost,
        freight_allocated,
        insurance_allocated,
        other_expenses_allocated,
        discount_allocated,
        landed_total_cost,
        landed_unit_cost,
        weight_kg,
        created_at,
        updated_at
      FROM dbo.purchase_entry_import_items
      WHERE company_id = @company_id
        AND import_id = @id
      ORDER BY line_no
    `);

  const installments = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query<PurchaseEntryImportInstallmentRow>(`
      SELECT
        id,
        import_id,
        company_id,
        line_no,
        installment_number,
        CONVERT(varchar(10), due_date, 23) AS due_date,
        amount,
        accounts_payable_id,
        created_at,
        updated_at
      FROM dbo.purchase_entry_import_installments
      WHERE company_id = @company_id
        AND import_id = @id
      ORDER BY line_no
    `);

  return {
    header: header.recordset[0],
    items: items.recordset,
    installments: installments.recordset,
  };
}

export async function updateImportFinancial(
  companyId: number,
  id: number,
  input: UpdateImportFinancialInput,
) {
  const pool = await getPool();

  await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .input("chart_account_id", input.chartAccountId ?? null)
    .input("cost_center_id", input.costCenterId ?? null)
    .input("payment_term_id", input.paymentTermId ?? null)
    .query(`
      UPDATE dbo.purchase_entry_imports
      SET
        chart_account_id = @chart_account_id,
        cost_center_id = @cost_center_id,
        payment_term_id = @payment_term_id,
        updated_at = SYSUTCDATETIME()
      WHERE company_id = @company_id
        AND id = @id
        AND status NOT IN ('CONFIRMED', 'CANCELED')
    `);
}

export async function updateImportLogistics(
  companyId: number,
  id: number,
  input: UpdateImportLogisticsInput,
) {
  const pool = await getPool();

  await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .input("carrier_id", input.carrierId ?? null)
    .input("carrier_vehicle_id", input.carrierVehicleId ?? null)
    .input("freight_mode", input.freightMode ?? null)
    .query(`
      UPDATE dbo.purchase_entry_imports
      SET
        carrier_id = @carrier_id,
        carrier_vehicle_id = @carrier_vehicle_id,
        freight_mode = @freight_mode,
        updated_at = SYSUTCDATETIME()
      WHERE company_id = @company_id
        AND id = @id
        AND status NOT IN ('CONFIRMED', 'CANCELED')
    `);
}

export async function updateImportSupplier(companyId: number, id: number, supplierId: number) {
  const pool = await getPool();

  await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .input("supplier_id", supplierId)
    .query(`
      UPDATE dbo.purchase_entry_imports
      SET
        supplier_id = @supplier_id,
        updated_at = SYSUTCDATETIME()
      WHERE company_id = @company_id
        AND id = @id
        AND status NOT IN ('CONFIRMED', 'CANCELED')
    `);
}

export async function updateImportItemProduct(
  companyId: number,
  id: number,
  itemId: number,
  productId: number,
) {
  const pool = await getPool();

  await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .input("item_id", itemId)
    .input("product_id", productId)
    .query(`
      UPDATE dbo.purchase_entry_import_items
      SET
        product_id = @product_id,
        match_status = 'MATCHED',
        match_notes = 'Vinculado manualmente',
        updated_at = SYSUTCDATETIME()
      WHERE company_id = @company_id
        AND import_id = @id
        AND id = @item_id
    `);
}

export async function updateImportItem(
  companyId: number,
  id: number,
  itemId: number,
  input: UpdateImportItemInput,
) {
  const pool = await getPool();

  const current = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .input("item_id", itemId)
    .query<{
      quantity: number;
      unit_price: number;
      total_price: number;
    }>(`
      SELECT TOP 1
        quantity,
        unit_price,
        total_price
      FROM dbo.purchase_entry_import_items
      WHERE company_id = @company_id
        AND import_id = @id
        AND id = @item_id
    `);

  const row = current.recordset[0];
  if (!row) {
    throw new Error("Item da importação não encontrado.");
  }

  const quantity = input.quantity ?? Number(row.quantity);
  const unitPrice = input.unitPrice ?? Number(row.unit_price);
  const totalPrice = input.totalPrice ?? Number((quantity * unitPrice).toFixed(2));

  await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .input("item_id", itemId)
    .input("quantity", quantity)
    .input("unit_price", unitPrice)
    .input("total_price", totalPrice)
    .query(`
      UPDATE dbo.purchase_entry_import_items
      SET
        quantity = @quantity,
        unit_price = @unit_price,
        total_price = @total_price,
        updated_at = SYSUTCDATETIME()
      WHERE company_id = @company_id
        AND import_id = @id
        AND id = @item_id
        AND match_status IN ('PENDING', 'MATCHED', 'REVIEW', 'NEW_PRODUCT')
    `);

  await recalcImportTotals(companyId, id);
  await recalculateImportItemAllocations(companyId, id);
}

export async function updateImportInstallment(
  companyId: number,
  id: number,
  installmentId: number,
  input: UpdateImportInstallmentInput,
) {
  const pool = await getPool();

  await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .input("installment_id", installmentId)
    .input("due_date", input.dueDate ?? null)
    .input("amount", input.amount ?? null)
    .query(`
      UPDATE dbo.purchase_entry_import_installments
      SET
        due_date = COALESCE(@due_date, due_date),
        amount = COALESCE(@amount, amount),
        updated_at = SYSUTCDATETIME()
      WHERE company_id = @company_id
        AND import_id = @id
        AND id = @installment_id
    `);

  await recalcImportTotals(companyId, id, false);
}

async function recalcImportTotalsCore(
  executor: SqlExecutor,
  companyId: number,
  id: number,
  syncInstallmentsFromItems = true,
) {
  const itemsResult = await executor
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query<{ products_amount: number }>(`
      SELECT
        COALESCE(SUM(total_price), 0) AS products_amount
      FROM dbo.purchase_entry_import_items
      WHERE company_id = @company_id
        AND import_id = @id
    `);

  const productsAmount = Number(itemsResult.recordset[0]?.products_amount ?? 0);

  const headerResult = await executor
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query<{
      freight_amount: number;
      insurance_amount: number;
      other_expenses_amount: number;
      discount_amount: number;
    }>(`
      SELECT
        freight_amount,
        insurance_amount,
        other_expenses_amount,
        discount_amount
      FROM dbo.purchase_entry_imports
      WHERE company_id = @company_id
        AND id = @id
    `);

  const freightAmount = Number(headerResult.recordset[0]?.freight_amount ?? 0);
  const insuranceAmount = Number(headerResult.recordset[0]?.insurance_amount ?? 0);
  const otherExpensesAmount = Number(
    headerResult.recordset[0]?.other_expenses_amount ?? 0,
  );
  const discountAmount = Number(headerResult.recordset[0]?.discount_amount ?? 0);

  const totalAmount = Number(
    (
      productsAmount +
      freightAmount +
      insuranceAmount +
      otherExpensesAmount -
      discountAmount
    ).toFixed(2),
  );

  await executor
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .input("products_amount", productsAmount)
    .input("total_amount", totalAmount)
    .query(`
      UPDATE dbo.purchase_entry_imports
      SET
        products_amount = @products_amount,
        total_amount = @total_amount,
        updated_at = SYSUTCDATETIME()
      WHERE company_id = @company_id
        AND id = @id
    `);

  if (syncInstallmentsFromItems) {
    const instCountResult = await executor
      .request()
      .input("company_id", companyId)
      .input("id", id)
      .query<{ cnt: number }>(`
        SELECT COUNT(*) AS cnt
        FROM dbo.purchase_entry_import_installments
        WHERE company_id = @company_id
          AND import_id = @id
      `);

    const count = Number(instCountResult.recordset[0]?.cnt ?? 0);

    if (count === 1) {
      await executor
        .request()
        .input("company_id", companyId)
        .input("id", id)
        .input("amount", totalAmount)
        .query(`
          UPDATE dbo.purchase_entry_import_installments
          SET
            amount = @amount,
            updated_at = SYSUTCDATETIME()
          WHERE company_id = @company_id
            AND import_id = @id
        `);
    }
  }
}

export async function recalcImportTotals(
  companyId: number,
  id: number,
  syncInstallmentsFromItems = true,
) {
  const pool = await getPool();
  await recalcImportTotalsCore(pool, companyId, id, syncInstallmentsFromItems);
}

async function recalculateImportItemAllocationsCore(
  executor: SqlExecutor,
  companyId: number,
  id: number,
) {
  const headerResult = await executor
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query<{
      allocation_method: "VALUE" | "QUANTITY" | "WEIGHT" | "MANUAL";
      freight_amount: number;
      insurance_amount: number;
      other_expenses_amount: number;
      discount_amount: number;
    }>(`
      SELECT TOP 1
        allocation_method,
        freight_amount,
        insurance_amount,
        other_expenses_amount,
        discount_amount
      FROM dbo.purchase_entry_imports
      WHERE company_id = @company_id
        AND id = @id
    `);

  const header = headerResult.recordset[0];
  if (!header) {
    throw new Error("Importação não encontrada.");
  }

  const itemsResult = await executor
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query<PurchaseEntryImportItemRow>(`
      SELECT
        id,
        import_id,
        company_id,
        line_no,
        supplier_code,
        ean,
        description,
        ncm,
        cfop,
        uom,
        quantity,
        unit_price,
        total_price,
        product_id,
        match_status,
        match_notes,
        gross_unit_cost,
        freight_allocated,
        insurance_allocated,
        other_expenses_allocated,
        discount_allocated,
        landed_total_cost,
        landed_unit_cost,
        weight_kg,
        created_at,
        updated_at
      FROM dbo.purchase_entry_import_items
      WHERE company_id = @company_id
        AND import_id = @id
      ORDER BY line_no
    `);

  const items = itemsResult.recordset;
  if (items.length === 0) return;

  if (header.allocation_method === "MANUAL") {
    for (const item of items) {
      const landedTotalCost = Number(
        (
          Number(item.total_price) +
          Number(item.freight_allocated ?? 0) +
          Number(item.insurance_allocated ?? 0) +
          Number(item.other_expenses_allocated ?? 0) -
          Number(item.discount_allocated ?? 0)
        ).toFixed(2),
      );

      const landedUnitCost =
        Number(item.quantity) > 0
          ? Number((landedTotalCost / Number(item.quantity)).toFixed(6))
          : 0;

      await executor
        .request()
        .input("item_id", item.id)
        .input("gross_unit_cost", Number(item.unit_price))
        .input("landed_total_cost", landedTotalCost)
        .input("landed_unit_cost", landedUnitCost)
        .query(`
          UPDATE dbo.purchase_entry_import_items
          SET
            gross_unit_cost = @gross_unit_cost,
            landed_total_cost = @landed_total_cost,
            landed_unit_cost = @landed_unit_cost,
            updated_at = SYSUTCDATETIME()
          WHERE id = @item_id
        `);
    }

    return;
  }

  const bases = items.map((item) => {
    if (header.allocation_method === "QUANTITY") {
      return Number(item.quantity);
    }

    if (header.allocation_method === "WEIGHT") {
      return Number(item.weight_kg ?? 0);
    }

    return Number(item.total_price);
  });

  const baseSum = bases.reduce((sum, x) => sum + x, 0);

  const fallbackBases =
    header.allocation_method === "WEIGHT" && baseSum <= 0
      ? items.map((item) => Number(item.total_price))
      : bases;

  const fallbackBaseSum = fallbackBases.reduce((sum, x) => sum + x, 0);

  function alloc(total: number, base: number) {
    if (!fallbackBaseSum || fallbackBaseSum <= 0) return 0;
    return Number(((total * base) / fallbackBaseSum).toFixed(2));
  }

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const base = fallbackBases[index];

    const freightAllocated = alloc(Number(header.freight_amount ?? 0), base);
    const insuranceAllocated = alloc(Number(header.insurance_amount ?? 0), base);
    const otherExpensesAllocated = alloc(
      Number(header.other_expenses_amount ?? 0),
      base,
    );
    const discountAllocated = alloc(Number(header.discount_amount ?? 0), base);

    const landedTotalCost = Number(
      (
        Number(item.total_price) +
        freightAllocated +
        insuranceAllocated +
        otherExpensesAllocated -
        discountAllocated
      ).toFixed(2),
    );

    const landedUnitCost =
      Number(item.quantity) > 0
        ? Number((landedTotalCost / Number(item.quantity)).toFixed(6))
        : 0;

    await executor
      .request()
      .input("item_id", item.id)
      .input("gross_unit_cost", Number(item.unit_price))
      .input("freight_allocated", freightAllocated)
      .input("insurance_allocated", insuranceAllocated)
      .input("other_expenses_allocated", otherExpensesAllocated)
      .input("discount_allocated", discountAllocated)
      .input("landed_total_cost", landedTotalCost)
      .input("landed_unit_cost", landedUnitCost)
      .query(`
        UPDATE dbo.purchase_entry_import_items
        SET
          gross_unit_cost = @gross_unit_cost,
          freight_allocated = @freight_allocated,
          insurance_allocated = @insurance_allocated,
          other_expenses_allocated = @other_expenses_allocated,
          discount_allocated = @discount_allocated,
          landed_total_cost = @landed_total_cost,
          landed_unit_cost = @landed_unit_cost,
          updated_at = SYSUTCDATETIME()
        WHERE id = @item_id
      `);
  }
}

export async function recalculateImportItemAllocations(
  companyId: number,
  id: number,
) {
  const pool = await getPool();
  await recalculateImportItemAllocationsCore(pool, companyId, id);
}

export async function getImportPendingCounts(companyId: number, id: number) {
  const pool = await getPool();

  const itemsResult = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query<{ pending_items: number }>(`
      SELECT
        SUM(CASE WHEN product_id IS NULL THEN 1 ELSE 0 END) AS pending_items
      FROM dbo.purchase_entry_import_items
      WHERE company_id = @company_id
        AND import_id = @id
    `);

  const headerResult = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query<{ header_ready: number }>(`
      SELECT
        CASE
          WHEN supplier_id IS NOT NULL THEN 1
          ELSE 0
        END AS header_ready
      FROM dbo.purchase_entry_imports
      WHERE company_id = @company_id
        AND id = @id
    `);

  return {
    pendingItems: Number(itemsResult.recordset[0]?.pending_items ?? 0),
    headerReady: Number(headerResult.recordset[0]?.header_ready ?? 0) === 1,
  };
}

export async function updateImportStatus(
  companyId: number,
  id: number,
  status: PurchaseEntryImportStatus,
  matchSummary?: string | null,
) {
  const pool = await getPool();

  await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .input("status", status)
    .input("match_summary", matchSummary ?? null)
    .query(`
      UPDATE dbo.purchase_entry_imports
      SET
        status = @status,
        match_summary = @match_summary,
        updated_at = SYSUTCDATETIME()
      WHERE company_id = @company_id
        AND id = @id
    `);
}

export async function cancelImport(companyId: number, id: number) {
  const pool = await getPool();

  await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      UPDATE dbo.purchase_entry_imports
      SET
        status = 'CANCELED',
        updated_at = SYSUTCDATETIME()
      WHERE company_id = @company_id
        AND id = @id
        AND status NOT IN ('CONFIRMED', 'CANCELED')
    `);
}

export async function createSupplierFromImport(
  companyId: number,
  importId: number,
  input?: CreateSupplierFromImportInput,
) {
  const pool = await getPool();

  const headerResult = await pool
    .request()
    .input("company_id", companyId)
    .input("id", importId)
    .query<{
      supplier_name: string | null;
      supplier_document: string | null;
      supplier_ie: string | null;
      supplier_address_line1: string | null;
      supplier_address_line2: string | null;
      supplier_district: string | null;
      supplier_city: string | null;
      supplier_state: string | null;
      supplier_zip_code: string | null;
      supplier_country: string | null;
    }>(`
      SELECT TOP 1
        supplier_name,
        supplier_document,
        supplier_ie,
        supplier_address_line1,
        supplier_address_line2,
        supplier_district,
        supplier_city,
        supplier_state,
        supplier_zip_code,
        supplier_country
      FROM dbo.purchase_entry_imports
      WHERE company_id = @company_id
        AND id = @id
    `);

  const header = headerResult.recordset[0];
  if (!header) {
    throw new Error("Importação não encontrada.");
  }

  const document = onlyDigits(header.supplier_document);
  const supplierName = clean(input?.overwriteName?.trim() || header.supplier_name, 160);

  if (!supplierName) {
    throw new Error("Nome do fornecedor não encontrado no XML.");
  }

  const existing = document
    ? await pool
        .request()
        .input("company_id", companyId)
        .input("document", document)
        .query<{ id: number }>(`
          SELECT TOP 1 id
          FROM dbo.suppliers
          WHERE company_id = @company_id
            AND REPLACE(REPLACE(REPLACE(document, '.', ''), '/', ''), '-', '') = @document
            AND deleted_at IS NULL
          ORDER BY id
        `)
    : null;

  if (existing?.recordset[0]?.id) {
    await updateImportSupplier(companyId, importId, existing.recordset[0].id);
    return existing.recordset[0].id;
  }

  const personType = document.length === 14 ? "PJ" : "PF";
  const ie = clean(header.supplier_ie, 30);

  const billingAddressLine1 = clean(header.supplier_address_line1, 120);
  const billingAddressLine2 = clean(header.supplier_address_line2, 120);
  const billingDistrict = clean(header.supplier_district, 80);
  const billingCity = clean(header.supplier_city, 80);
  const billingState = clean(header.supplier_state, 2);
  const billingZipCode = clean(onlyDigits(header.supplier_zip_code), 12);
  const billingCountry = normalizeCountry(header.supplier_country);

  const shippingAddressLine1 = clean(header.supplier_address_line1, 120);
  const shippingAddressLine2 = clean(header.supplier_address_line2, 120);
  const shippingDistrict = clean(header.supplier_district, 80);
  const shippingCity = clean(header.supplier_city, 80);
  const shippingState = clean(header.supplier_state, 2);
  const shippingZipCode = clean(onlyDigits(header.supplier_zip_code), 12);
  const shippingCountry = normalizeCountry(header.supplier_country);

  const created = await pool
    .request()
    .input("company_id", companyId)
    .input("name", supplierName)
    .input("person_type", personType)
    .input("document", clean(document, 20))
    .input("ie", ie)
    .input("billing_address_line1", billingAddressLine1)
    .input("billing_address_line2", billingAddressLine2)
    .input("billing_district", billingDistrict)
    .input("billing_city", billingCity)
    .input("billing_state", billingState)
    .input("billing_zip_code", billingZipCode)
    .input("billing_country", billingCountry)
    .input("shipping_address_line1", shippingAddressLine1)
    .input("shipping_address_line2", shippingAddressLine2)
    .input("shipping_district", shippingDistrict)
    .input("shipping_city", shippingCity)
    .input("shipping_state", shippingState)
    .input("shipping_zip_code", shippingZipCode)
    .input("shipping_country", shippingCountry)
    .query<{ id: number }>(`
      INSERT INTO dbo.suppliers (
        company_id,
        name,
        person_type,
        document,
        ie,
        is_active,
        billing_address_line1,
        billing_address_line2,
        billing_district,
        billing_city,
        billing_state,
        billing_zip_code,
        billing_country,
        shipping_address_line1,
        shipping_address_line2,
        shipping_district,
        shipping_city,
        shipping_state,
        shipping_zip_code,
        shipping_country,
        created_at
      )
      OUTPUT INSERTED.id
      VALUES (
        @company_id,
        @name,
        @person_type,
        @document,
        @ie,
        1,
        @billing_address_line1,
        @billing_address_line2,
        @billing_district,
        @billing_city,
        @billing_state,
        @billing_zip_code,
        @billing_country,
        @shipping_address_line1,
        @shipping_address_line2,
        @shipping_district,
        @shipping_city,
        @shipping_state,
        @shipping_zip_code,
        @shipping_country,
        SYSUTCDATETIME()
      )
    `);

  const supplierId = Number(created.recordset[0].id);

  await updateImportSupplier(companyId, importId, supplierId);

  return supplierId;
}

export async function createProductFromImportItem(
  companyId: number,
  importId: number,
  itemId: number,
  input?: CreateProductFromImportItemInput,
) {
  const pool = await getPool();

  const itemResult = await pool
    .request()
    .input("company_id", companyId)
    .input("import_id", importId)
    .input("item_id", itemId)
    .query<{
      description: string;
      ean: string | null;
      ncm: string | null;
      uom: string | null;
      unit_price: number;
      gross_unit_cost: number;
      freight_allocated: number;
      insurance_allocated: number;
      other_expenses_allocated: number;
      discount_allocated: number;
      landed_total_cost: number;
      landed_unit_cost: number;
      weight_kg: number | null;
      product_id: number | null;
    }>(`
      SELECT TOP 1
        description,
        ean,
        ncm,
        uom,
        unit_price,
        gross_unit_cost,
        freight_allocated,
        insurance_allocated,
        other_expenses_allocated,
        discount_allocated,
        landed_total_cost,
        landed_unit_cost,
        weight_kg,
        product_id
      FROM dbo.purchase_entry_import_items
      WHERE company_id = @company_id
        AND import_id = @import_id
        AND id = @item_id
    `);

  const item = itemResult.recordset[0];
  if (!item) {
    throw new Error("Item da importação não encontrado.");
  }

  if (item.product_id) {
    return item.product_id;
  }

  const productName = input?.overwriteName?.trim() || item.description?.trim();
  if (!productName) {
    throw new Error("Descrição do produto não encontrada no item.");
  }

  const existingByEan =
    item.ean?.trim()
      ? await pool
          .request()
          .input("company_id", companyId)
          .input("ean", item.ean.trim())
          .query<{ id: number }>(`
            SELECT TOP 1 id
            FROM dbo.products
            WHERE company_id = @company_id
              AND ean = @ean
            ORDER BY id
          `)
      : null;

  if (existingByEan?.recordset[0]?.id) {
    await updateImportItemProduct(
      companyId,
      importId,
      itemId,
      existingByEan.recordset[0].id,
    );
    return existingByEan.recordset[0].id;
  }

  const uomIdResult = await pool
    .request()
    .query<{ id: number }>(`
      SELECT TOP 1 id
      FROM dbo.fiscal_uom
      WHERE code = 'UN' OR code = 'un'
      ORDER BY id
    `);

  const uomId = Number(uomIdResult.recordset[0]?.id ?? 0);
  if (!uomId) {
    throw new Error("UOM padrão 'UN' não encontrada.");
  }

  const kind = input?.kind ?? "product";
  const trackInventory = input?.trackInventory ?? true;

  let ncmCode = (item.ncm ?? "").replace(/\D/g, "");
  let ncmId: number | null = null;

  if (kind === "product") {
    if (!ncmCode) {
      throw new Error(
        "Não foi possível criar o produto: item do XML sem NCM. Revise o XML ou cadastre o produto manualmente.",
      );
    }

    const ncmResult = await pool
      .request()
      .input("ncm_code", ncmCode)
      .query<{ id: number; code: string }>(`
        SELECT TOP 1 id, code
        FROM dbo.fiscal_ncm
        WHERE REPLACE(REPLACE(REPLACE(code, '.', ''), '/', ''), '-', '') = @ncm_code
        ORDER BY id
      `);

    if (!ncmResult.recordset[0]?.id) {
      throw new Error(
        `Não foi possível criar o produto: NCM ${ncmCode} não encontrado na base fiscal.`,
      );
    }

    ncmId = Number(ncmResult.recordset[0].id);
    ncmCode = String(ncmResult.recordset[0].code ?? ncmCode);
  }

  const created = await pool
    .request()
    .input("company_id", companyId)
    .input("name", productName)
    .input("sku", null)
    .input("ean", item.ean ?? null)
    .input("price", 0)
    .input("cost", Number(item.unit_price ?? 0))
    .input("kind", kind)
    .input("uom", item.uom ?? "UN")
    .input("uom_id", uomId)
    .input("track_inventory", trackInventory ? 1 : 0)
    .input("ncm", kind === "product" ? ncmCode : null)
    .input("ncm_id", kind === "product" ? ncmId : null)
    .query<{ id: number }>(`
      INSERT INTO dbo.products (
        company_id,
        name,
        sku,
        ean,
        price,
        cost,
        active,
        created_at,
        kind,
        uom,
        track_inventory,
        ncm,
        ncm_id,
        uom_id
      )
      OUTPUT INSERTED.id
      VALUES (
        @company_id,
        @name,
        @sku,
        @ean,
        @price,
        @cost,
        1,
        SYSUTCDATETIME(),
        @kind,
        @uom,
        @track_inventory,
        @ncm,
        @ncm_id,
        @uom_id
      )
    `);

  const productId = Number(created.recordset[0].id);

  await updateImportItemProduct(companyId, importId, itemId, productId);

  return productId;
}

export async function materializePurchaseEntry(
  tx: Transaction,
  companyId: number,
  userId: number,
  header: PurchaseEntryImportRow,
  items: PurchaseEntryImportItemRow[],
  installments: PurchaseEntryImportInstallmentRow[],
) {
  const entryResult = await tx
    .request()
    .input("company_id", companyId)
    .input("source_import_id", header.id)
    .input("origin_type", "XML_IMPORT")
    .input("purchase_order_id", header.purchase_order_id ?? null)
    .input("supplier_id", header.supplier_id)
    .input("carrier_id", header.carrier_id ?? null)
    .input("carrier_vehicle_id", header.carrier_vehicle_id ?? null)
    .input("access_key", header.access_key)
    .input("invoice_number", header.invoice_number ?? null)
    .input("invoice_series", header.invoice_series ?? null)
    .input("issue_date", header.issue_date ?? null)
    .input("entry_date", header.issue_date ?? null)
    .input("freight_mode", header.freight_mode ?? null)
    .input("products_amount", header.products_amount)
    .input("freight_amount", header.freight_amount)
    .input("insurance_amount", header.insurance_amount)
    .input("other_expenses_amount", header.other_expenses_amount)
    .input("discount_amount", header.discount_amount)
    .input("total_amount", header.total_amount)
    .input("payment_term_id", header.payment_term_id ?? null)
    .input("chart_account_id", header.chart_account_id ?? null)
    .input("cost_center_id", header.cost_center_id ?? null)
    .input("allocation_method", header.allocation_method)
    .input("cost_policy", header.cost_policy)
    .input("price_policy", header.price_policy)
    .input("markup_percent", header.markup_percent ?? null)
    .input("margin_percent", header.margin_percent ?? null)
    .input("accounts_payable_id", header.accounts_payable_id ?? null)
    .input("fiscal_document_id", header.fiscal_document_id ?? null)
    .input("status", "CONFIRMED")
    .input("confirmed_by_user_id", userId)
    .query<{ id: number }>(`
      INSERT INTO dbo.purchase_entries (
        company_id,
        source_import_id,
        origin_type,
        purchase_order_id,
        supplier_id,
        carrier_id,
        carrier_vehicle_id,
        access_key,
        invoice_number,
        invoice_series,
        issue_date,
        entry_date,
        freight_mode,
        products_amount,
        freight_amount,
        insurance_amount,
        other_expenses_amount,
        discount_amount,
        total_amount,
        payment_term_id,
        chart_account_id,
        cost_center_id,
        allocation_method,
        cost_policy,
        price_policy,
        markup_percent,
        margin_percent,
        accounts_payable_id,
        fiscal_document_id,
        status,
        confirmed_by_user_id
      )
      OUTPUT INSERTED.id
      VALUES (
        @company_id,
        @source_import_id,
        @origin_type,
        @purchase_order_id,
        @supplier_id,
        @carrier_id,
        @carrier_vehicle_id,
        @access_key,
        @invoice_number,
        @invoice_series,
        @issue_date,
        COALESCE(@entry_date, SYSUTCDATETIME()),
        @freight_mode,
        @products_amount,
        @freight_amount,
        @insurance_amount,
        @other_expenses_amount,
        @discount_amount,
        @total_amount,
        @payment_term_id,
        @chart_account_id,
        @cost_center_id,
        @allocation_method,
        @cost_policy,
        @price_policy,
        @markup_percent,
        @margin_percent,
        @accounts_payable_id,
        @fiscal_document_id,
        @status,
        @confirmed_by_user_id
      )
    `);

  const purchaseEntryId = Number(entryResult.recordset[0].id);

  for (const item of items) {
    await tx
      .request()
      .input("purchase_entry_id", purchaseEntryId)
      .input("company_id", companyId)
      .input("source_import_item_id", item.id)
      .input("line_no", item.line_no)
      .input("product_id", item.product_id)
      .input("supplier_code", item.supplier_code ?? null)
      .input("ean", item.ean ?? null)
      .input("description_snapshot", item.description)
      .input("ncm_snapshot", item.ncm ?? null)
      .input("cfop_snapshot", item.cfop ?? null)
      .input("uom_snapshot", item.uom ?? null)
      .input("quantity", item.quantity)
      .input("unit_price", item.unit_price)
      .input("total_price", item.total_price)
      .input("freight_allocated", item.freight_allocated ?? 0)
      .input("insurance_allocated", item.insurance_allocated ?? 0)
      .input("other_expenses_allocated", item.other_expenses_allocated ?? 0)
      .input("discount_allocated", item.discount_allocated ?? 0)
      .input("landed_total_cost", item.landed_total_cost ?? item.total_price)
      .input("landed_unit_cost", item.landed_unit_cost ?? item.unit_price)
      .query(`
        INSERT INTO dbo.purchase_entry_items (
          purchase_entry_id,
          company_id,
          source_import_item_id,
          line_no,
          product_id,
          supplier_code,
          ean,
          description_snapshot,
          ncm_snapshot,
          cfop_snapshot,
          uom_snapshot,
          quantity,
          unit_price,
          total_price,
          freight_allocated,
          insurance_allocated,
          other_expenses_allocated,
          discount_allocated,
          landed_total_cost,
          landed_unit_cost
        )
        VALUES (
          @purchase_entry_id,
          @company_id,
          @source_import_item_id,
          @line_no,
          @product_id,
          @supplier_code,
          @ean,
          @description_snapshot,
          @ncm_snapshot,
          @cfop_snapshot,
          @uom_snapshot,
          @quantity,
          @unit_price,
          @total_price,
          @freight_allocated,
          @insurance_allocated,
          @other_expenses_allocated,
          @discount_allocated,
          @landed_total_cost,
          @landed_unit_cost
        )
      `);
  }

  for (const inst of installments) {
    await tx
      .request()
      .input("purchase_entry_id", purchaseEntryId)
      .input("company_id", companyId)
      .input("source_import_installment_id", inst.id || null)
      .input("installment_no", inst.line_no)
      .input("due_date", inst.due_date)
      .input("amount", inst.amount)
      .input("account_payable_id", inst.accounts_payable_id ?? null)
      .query(`
        INSERT INTO dbo.purchase_entry_installments (
          purchase_entry_id,
          company_id,
          source_import_installment_id,
          installment_no,
          due_date,
          amount,
          account_payable_id
        )
        VALUES (
          @purchase_entry_id,
          @company_id,
          @source_import_installment_id,
          @installment_no,
          @due_date,
          @amount,
          @account_payable_id
        )
      `);
  }

  return purchaseEntryId;
}

export async function confirmImport(companyId: number, userId: number, id: number) {
  const pool = await getPool();
  const tx = pool.transaction();

  await tx.begin();

  try {
    const headerResult = await tx
      .request()
      .input("company_id", companyId)
      .input("id", id)
      .query<PurchaseEntryImportRow>(`
        SELECT TOP 1
          id,
          company_id,
          access_key,
          invoice_number,
          invoice_series,
          issue_date,
          supplier_document,
          supplier_name,
          supplier_ie,
          supplier_id,
          supplier_address_line1,
          supplier_address_line2,
          supplier_district,
          supplier_city,
          supplier_state,
          supplier_zip_code,
          supplier_country,
          chart_account_id,
          cost_center_id,
          payment_term_id,
          total_amount,
          products_amount,
          freight_amount,
          insurance_amount,
          other_expenses_amount,
          discount_amount,
          carrier_id,
          carrier_vehicle_id,
          freight_mode,
          carrier_name_xml,
          carrier_document_xml,
          carrier_ie_xml,
          allocation_method,
          cost_policy,
          price_policy,
          markup_percent,
          margin_percent,
          purchase_order_id,
          definitive_purchase_entry_id,
          source_file_name,
          status,
          match_summary,
          error_message,
          accounts_payable_id,
          fiscal_document_id,
          confirmed_at,
          confirmed_by_user_id,
          created_at,
          updated_at
        FROM dbo.purchase_entry_imports
        WHERE company_id = @company_id
          AND id = @id
      `);

    const header = headerResult.recordset[0];
    if (!header) throw new Error("Importação não encontrada.");
    if (header.status === "CONFIRMED") throw new Error("Importação já confirmada.");
    if (header.status === "CANCELED") throw new Error("Importação cancelada.");
    if (!header.supplier_id) throw new Error("Fornecedor não vinculado.");

    const itemsResult = await tx
      .request()
      .input("company_id", companyId)
      .input("id", id)
      .query<PurchaseEntryImportItemRow>(`
        SELECT
          id,
          import_id,
          company_id,
          line_no,
          supplier_code,
          ean,
          description,
          ncm,
          cfop,
          uom,
          quantity,
          unit_price,
          total_price,
          product_id,
          match_status,
          match_notes,
          gross_unit_cost,
          freight_allocated,
          insurance_allocated,
          other_expenses_allocated,
          discount_allocated,
          landed_total_cost,
          landed_unit_cost,
          weight_kg,
          created_at,
          updated_at
        FROM dbo.purchase_entry_import_items
        WHERE company_id = @company_id
          AND import_id = @id
        ORDER BY line_no
      `);

    const items = itemsResult.recordset;
    if (items.length === 0) throw new Error("Importação sem itens.");
    if (items.some((x) => !x.product_id)) {
      throw new Error("Existem itens sem produto vinculado.");
    }

    await recalcImportTotalsCore(tx, companyId, id);
    await recalculateImportItemAllocationsCore(tx, companyId, id);

    const refreshedHeaderResult = await tx
      .request()
      .input("company_id", companyId)
      .input("id", id)
      .query<PurchaseEntryImportRow>(`
        SELECT TOP 1
          id,
          company_id,
          access_key,
          invoice_number,
          invoice_series,
          issue_date,
          supplier_document,
          supplier_name,
          supplier_ie,
          supplier_id,
          supplier_address_line1,
          supplier_address_line2,
          supplier_district,
          supplier_city,
          supplier_state,
          supplier_zip_code,
          supplier_country,
          chart_account_id,
          cost_center_id,
          payment_term_id,
          total_amount,
          products_amount,
          freight_amount,
          insurance_amount,
          other_expenses_amount,
          discount_amount,
          carrier_id,
          carrier_vehicle_id,
          freight_mode,
          carrier_name_xml,
          carrier_document_xml,
          carrier_ie_xml,
          allocation_method,
          cost_policy,
          price_policy,
          markup_percent,
          margin_percent,
          purchase_order_id,
          definitive_purchase_entry_id,
          source_file_name,
          status,
          match_summary,
          error_message,
          accounts_payable_id,
          fiscal_document_id,
          confirmed_at,
          confirmed_by_user_id,
          created_at,
          updated_at
        FROM dbo.purchase_entry_imports
        WHERE company_id = @company_id
          AND id = @id
      `);

    const refreshedItemsResult = await tx
      .request()
      .input("company_id", companyId)
      .input("id", id)
      .query<PurchaseEntryImportItemRow>(`
        SELECT
          id,
          import_id,
          company_id,
          line_no,
          supplier_code,
          ean,
          description,
          ncm,
          cfop,
          uom,
          quantity,
          unit_price,
          total_price,
          product_id,
          match_status,
          match_notes,
          gross_unit_cost,
          freight_allocated,
          insurance_allocated,
          other_expenses_allocated,
          discount_allocated,
          landed_total_cost,
          landed_unit_cost,
          weight_kg,
          created_at,
          updated_at
        FROM dbo.purchase_entry_import_items
        WHERE company_id = @company_id
          AND import_id = @id
        ORDER BY line_no
      `);

    const refreshedItems = refreshedItemsResult.recordset;

    const installmentsResult = await tx
      .request()
      .input("company_id", companyId)
      .input("id", id)
      .query<PurchaseEntryImportInstallmentRow>(`
        SELECT
          id,
          import_id,
          company_id,
          line_no,
          installment_number,
          CONVERT(varchar(10), due_date, 23) AS due_date,
          amount,
          accounts_payable_id,
          created_at,
          updated_at
        FROM dbo.purchase_entry_import_installments
        WHERE company_id = @company_id
          AND import_id = @id
        ORDER BY line_no
      `);

    const installments = installmentsResult.recordset;

    const issueDateValue = header.issue_date ? new Date(header.issue_date) : null;
    if (!issueDateValue || Number.isNaN(issueDateValue.getTime())) {
      throw new Error(
        "Importação sem data de emissão válida para gerar estoque e contas a pagar.",
      );
    }

    const issueDateSql = issueDateValue.toISOString().slice(0, 10);

    for (const item of refreshedItems) {
      const qty = Number(item.quantity);

      if (!qty || qty <= 0) {
        throw new Error(`Item ${item.id} com quantidade inválida para entrada de estoque.`);
      }

      await tx
        .request()
        .input("company_id", companyId)
        .input("product_id", item.product_id)
        .input("type", "IN")
        .input("quantity", qty)
        .input("source", "PURCHASE_XML")
        .input("source_id", id)
        .input("note", `Entrada via XML ${header.invoice_number ?? ""}`.trim())
        .input("source_type", "PURCHASE_XML")
        .input("reason", "PURCHASE_XML")
        .input("idempotency_key", `PURCHASE_XML:${id}:ITEM:${item.id}`)
        .input("occurred_at", issueDateValue)
        .execute("dbo.sp_inventory_move");
    }

    const effectiveInstallments =
      installments.length > 0
        ? installments
        : [
            {
              id: 0,
              import_id: id,
              company_id: companyId,
              line_no: 1,
              installment_number: "001",
              due_date: issueDateSql,
              amount: Number(refreshedHeaderResult.recordset[0].total_amount),
              accounts_payable_id: null,
              created_at: "",
              updated_at: null,
            },
          ];

    let firstAccountsPayableId: number | null = null;

    for (const inst of effectiveInstallments) {
      const payableResult = await tx
        .request()
        .input("company_id", companyId)
        .input("supplier_id", header.supplier_id)
        .input("document_number", header.invoice_number ?? null)
        .input("issue_date", issueDateSql)
        .input("due_date", inst.due_date)
        .input("competence_date", issueDateSql)
        .input(
          "description",
          `NF-e de entrada ${header.invoice_number ?? header.access_key} - parcela ${inst.installment_number ?? inst.line_no}`,
        )
        .input("amount", inst.amount)
        .input("open_amount", inst.amount)
        .input("status", "OPEN")
        .input("payment_term_id", header.payment_term_id ?? null)
        .input("chart_account_id", header.chart_account_id ?? null)
        .input("cost_center_id", header.cost_center_id ?? null)
        .input("source_type", "PURCHASE_XML")
        .input("source_id", id)
        .input("installment_no", inst.line_no)
        .input("installment_count", effectiveInstallments.length)
        .query<{ id: number }>(`
          INSERT INTO dbo.accounts_payable (
            company_id,
            supplier_id,
            document_number,
            issue_date,
            due_date,
            competence_date,
            description,
            amount,
            open_amount,
            status,
            payment_term_id,
            chart_account_id,
            cost_center_id,
            source_type,
            source_id,
            installment_no,
            installment_count
          )
          OUTPUT INSERTED.id
          VALUES (
            @company_id,
            @supplier_id,
            @document_number,
            @issue_date,
            @due_date,
            @competence_date,
            @description,
            @amount,
            @open_amount,
            @status,
            @payment_term_id,
            @chart_account_id,
            @cost_center_id,
            @source_type,
            @source_id,
            @installment_no,
            @installment_count
          )
        `);

      const payableId = Number(payableResult.recordset[0].id);

      if (!firstAccountsPayableId) {
        firstAccountsPayableId = payableId;
      }

      if (inst.id) {
        await tx
          .request()
          .input("installment_id", inst.id)
          .input("accounts_payable_id", payableId)
          .query(`
            UPDATE dbo.purchase_entry_import_installments
            SET
              accounts_payable_id = @accounts_payable_id,
              updated_at = SYSUTCDATETIME()
            WHERE id = @installment_id
          `);
      }
    }

    const refreshedHeader = {
      ...refreshedHeaderResult.recordset[0],
      accounts_payable_id: firstAccountsPayableId,
    } as PurchaseEntryImportRow;

    const definitivePurchaseEntryId = await materializePurchaseEntry(
      tx,
      companyId,
      userId,
      refreshedHeader,
      refreshedItems,
      effectiveInstallments,
    );

    await tx
      .request()
      .input("company_id", companyId)
      .input("id", id)
      .input("accounts_payable_id", firstAccountsPayableId)
      .input("definitive_purchase_entry_id", definitivePurchaseEntryId)
      .input("user_id", userId)
      .query(`
        UPDATE dbo.purchase_entry_imports
        SET
          status = 'CONFIRMED',
          accounts_payable_id = @accounts_payable_id,
          definitive_purchase_entry_id = @definitive_purchase_entry_id,
          confirmed_at = SYSUTCDATETIME(),
          confirmed_by_user_id = @user_id,
          updated_at = SYSUTCDATETIME()
        WHERE company_id = @company_id
          AND id = @id
      `);

    await tx.commit();

    return {
      accountsPayableId: firstAccountsPayableId,
      purchaseEntryId: definitivePurchaseEntryId,
    };
  } catch (err: any) {
    try {
      await tx.rollback();
    } catch {
      // ignora erro secundário de rollback
    }

    const originalMessage =
      err?.originalError?.info?.message ||
      err?.originalError?.message ||
      err?.message ||
      "Erro ao confirmar importação.";

    throw new Error(originalMessage);
  }
}

export async function listSuppliersMini(companyId: number): Promise<SupplierMini[]> {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("company_id", companyId)
    .query<SupplierMini>(`
      SELECT TOP 300
        id,
        name,
        document
      FROM dbo.suppliers
      WHERE company_id = @company_id
        AND deleted_at IS NULL
        AND is_active = 1
      ORDER BY name
    `);

  return result.recordset;
}

export async function listProductsMini(companyId: number): Promise<ProductMini[]> {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("company_id", companyId)
    .query<ProductMini>(`
      SELECT TOP 1000
        id,
        name,
        sku,
        ean
      FROM dbo.products
      WHERE company_id = @company_id
        AND active = 1
      ORDER BY name
    `);

  return result.recordset;
}