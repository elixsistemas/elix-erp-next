// bank-accounts.types.ts
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
};
