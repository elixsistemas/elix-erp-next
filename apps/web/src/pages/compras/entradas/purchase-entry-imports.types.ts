export type PurchaseEntryImportStatus =
  | "IMPORTED"
  | "MATCH_PENDING"
  | "READY"
  | "CONFIRMED"
  | "ERROR"
  | "CANCELED";

export type PurchaseEntryItemMatchStatus =
  | "PENDING"
  | "MATCHED"
  | "REVIEW"
  | "NEW_PRODUCT";

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
  discount_amount: number;

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

export type SupplierMini = {
  id: number;
  name: string;
};

export type ProductMini = {
  id: number;
  name: string;
  sku?: string | null;
};

export type MiniOption = {
  id: number;
  name: string;
  code?: string | null;
};

export type FinancialOptions = {
  chartAccounts: MiniOption[];
  costCenters: MiniOption[];
  paymentTerms: MiniOption[];
};