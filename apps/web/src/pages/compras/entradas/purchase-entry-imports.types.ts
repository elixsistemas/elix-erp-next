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

export type AllocationMethod = "VALUE" | "QUANTITY" | "WEIGHT" | "MANUAL";

export type CostPolicy = "LAST_COST" | "AVERAGE_COST" | "LANDED_LAST_COST";

export type PricePolicy = "NONE" | "MARKUP" | "MARGIN" | "SUGGESTED_ONLY";

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

  allocation_method: AllocationMethod;
  cost_policy: CostPolicy;
  price_policy: PricePolicy;
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

export type UpdateImportFinancialPayload = {
  chartAccountId?: number | null;
  costCenterId?: number | null;
  paymentTermId?: number | null;
};

export type UpdateImportLogisticsPayload = {
  carrierId?: number | null;
  carrierVehicleId?: number | null;
  freightMode?: string | null;
};

export type UpdateImportItemPayload = {
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
};

export type UpdateImportInstallmentPayload = {
  dueDate?: string;
  amount?: number;
};

export type ConfirmImportEconomicsRow = {
  purchaseEntryItemId: number;
  productId: number;
  quantity: number;
  landedUnitCost: number;
  previousCost: number;
  newCost: number;
  previousPrice: number;
  suggestedPrice: number | null;
  appliedPrice: number;
  priceChanged: boolean;
  movedToStock: boolean;
  currentMarginPercent: number;
  projectedMarginPercent: number;
};

export type ConfirmationPreviewItem = {
  importItemId: number;
  lineNo: number;
  productId: number | null;
  productName: string | null;
  quantity: number;
  unitPrice: number;
  landedUnitCost: number;
  landedTotalCost: number;
  previousCost: number;
  newCost: number;
  previousPrice: number;
  suggestedPrice: number | null;
  appliedPrice: number;
  movedToStock: boolean;
  currentMarginPercent: number;
  projectedMarginPercent: number;
};

export type PurchaseEntryStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "POSTED"
  | "CANCELED";

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
  allocation_method: AllocationMethod;
  cost_policy: CostPolicy;
  price_policy: PricePolicy;
  markup_percent: number | null;
  margin_percent: number | null;
  accounts_payable_id: number | null;
  fiscal_document_id: number | null;
  status: PurchaseEntryStatus;
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

export type ConfirmImportResponse = {
  accountsPayableId: number | null;
  purchaseEntryId: number;
  economics?: ConfirmImportEconomicsRow[];
};

export type UpdateImportEconomicsPayload = {
  allocationMethod?: AllocationMethod;
  costPolicy?: CostPolicy;
  pricePolicy?: PricePolicy;
  markupPercent?: number | null;
  marginPercent?: number | null;
};

export type UpdateImportItemAllocationPayload = {
  freightAllocated?: number;
  insuranceAllocated?: number;
  otherExpensesAllocated?: number;
  discountAllocated?: number;
};

export type PurchaseEntryConfirmationPreviewRow = {
  importItemId: number;
  lineNo: number;
  productId: number | null;
  productName: string | null;
  quantity: number;
  unitPrice: number;
  landedUnitCost: number;
  landedTotalCost: number;
  previousCost: number;
  newCost: number;
  previousPrice: number;
  suggestedPrice: number | null;
  appliedPrice: number;
  movedToStock: boolean;
  currentMarginPercent: number;
  projectedMarginPercent: number;
};

export type PurchaseEntryConfirmationPreview = {
  header: {
    productsAmount: number;
    freightAmount: number;
    insuranceAmount: number;
    otherExpensesAmount: number;
    discountAmount: number;
    totalAmount: number;
  };
  items: PurchaseEntryConfirmationPreviewRow[];
};

export type ConfirmationPreview = PurchaseEntryConfirmationPreview;