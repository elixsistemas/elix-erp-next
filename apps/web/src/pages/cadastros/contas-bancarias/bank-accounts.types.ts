export type BankAccountType = "checking" | "savings" | "payment" | "cash" | "other";

export type PixKeyType = "cpf" | "cnpj" | "email" | "phone" | "random" | "other";

export type BankAccount = {
  id: number;
  company_id: number;
  bank_code: string;
  name: string;
  agency: string | null;
  account: string | null;
  account_digit: string | null;
  convenio: string | null;
  wallet: string | null;
  settings_json: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;

  account_type: BankAccountType;
  bank_name: string | null;
  bank_ispb: string | null;
  branch_digit: string | null;
  holder_name: string | null;
  holder_document: string | null;
  pix_key_type: PixKeyType | null;
  pix_key_value: string | null;
  is_default: boolean;
  allow_receipts: boolean;
  allow_payments: boolean;
  reconciliation_enabled: boolean;
  external_code: string | null;
  notes: string | null;
};