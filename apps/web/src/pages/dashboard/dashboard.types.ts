// dashboard.types.ts
export type FinanceAccount = {
  id: number;
  name: string;
  bank_code?: string | null;
  agency?: string | null;
  account?: string | null;
  account_digit?: string | null;
  balance: number;
};

export type FinanceSummary = {
  month: string | null;
  totalBalance: number;
  inflowMonth: number;
  outflowMonth: number;
  netMonth: number;
  accounts: FinanceAccount[];
};
