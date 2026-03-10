export type AccountsPayableStatus =
  | "OPEN"
  | "PARTIAL"
  | "PAID"
  | "OVERDUE"
  | "CANCELED";

export type AccountsPayableRow = {
  id: number;
  company_id: number;
  supplier_id: number;
  supplier_name: string;
  document_number: string | null;
  issue_date: string;
  due_date: string;
  competence_date: string | null;
  description: string;
  amount: number;
  open_amount: number;
  status: AccountsPayableStatus;
  payment_term_id: number | null;
  payment_term_name: string | null;
  payment_method_id: number | null;
  payment_method_name: string | null;
  bank_account_id: number | null;
  bank_account_name: string | null;
  chart_account_id: number | null;
  chart_account_name: string | null;
  cost_center_id: number | null;
  cost_center_name: string | null;
  source_type: string | null;
  source_id: number | null;
  installment_no: number | null;
  installment_count: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
};

export type SupplierMini = {
  id: number;
  name: string;
};

export type PaymentConditionMini = {
  id: number;
  name: string;
};

export type PaymentMethodMini = {
  id: number;
  name: string;
};

export type BankAccountMini = {
  id: number;
  name: string;
};

export type ChartAccountMini = {
  id: number;
  name: string;
};

export type CostCenterMini = {
  id: number;
  name: string;
};