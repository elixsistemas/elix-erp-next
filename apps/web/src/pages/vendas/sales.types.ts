export type SaleStatus = "open" | "closed" | "cancelled";

export type SaleRow = {
  id: number;
  company_id?: number;
  customer_id: number;

  quote_id: number | null;
  order_id: number | null;

  status: SaleStatus | string;

  subtotal: number;
  discount: number;
  total: number;
  notes: string | null;
  created_at: string;

  payment_method_id: number | null;
  payment_term_id: number | null;
};

export type SaleItemRow = {
  id: number;
  sale_id: number;
  product_id: number;
  kind?: "product" | "service";
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
};

export type SaleDetails = {
  sale: SaleRow;
  items: SaleItemRow[];
};

export type FiscalDoc = {
  id: number;
  type: "NFE" | "NFSE";
  status: string;
  created_at: string;
};

export type PaymentTermRow = {
  id: number;
  company_id?: number;
  name: string;
  offsets: number[];
  offsets_json?: string;
  active: boolean;
  created_at: string;
};

export type BankAccountRow = {
  id: number;
  bank_code: string;
  name: string;
  agency?: string | null;
  account?: string | null;
  account_digit?: string | null;
  active: boolean;
};

export type PreviewInstallmentsResponse = {
  issueDate: string; // YYYY-MM-DD
  total: number;
  installments: Array<{
    installmentNumber: number;
    dueDate: string; // YYYY-MM-DD
    amount: number;
  }>;
};

export type CloseSaleBody = {
  bankAccountId: number;
  documentNo?: string | null;
  note?: string | null;
  installments: Array<{ dueDate: string; amount: number }>;
};

export type CloseSaleResult = {
  sale: SaleRow;
  receivablesCreated: number;
};
