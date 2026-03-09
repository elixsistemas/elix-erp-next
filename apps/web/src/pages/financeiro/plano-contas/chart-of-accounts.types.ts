export type ChartAccountNature =
  | "asset"
  | "liability"
  | "equity"
  | "revenue"
  | "expense";

export type ChartAccountKind = "synthetic" | "analytic";

export type ChartAccountDreGroup =
  | "gross_revenue"
  | "deductions"
  | "net_revenue"
  | "cogs"
  | "operating_expense"
  | "financial_result"
  | "taxes_on_profit"
  | "other_operating_result";

export type ChartAccountRow = {
  id: number;
  company_id: number;
  parent_id: number | null;
  code: string;
  name: string;
  nature: ChartAccountNature;
  account_kind: ChartAccountKind;
  allow_posting: boolean;
  is_result_account: boolean;
  dre_group: ChartAccountDreGroup | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ChartAccountNode = ChartAccountRow & {
  children: ChartAccountNode[];
};

export type ChartAccountListFilters = {
  search?: string;
  active?: "true" | "false" | "";
};

export type ChartAccountPayload = {
  parentId: number | null;
  code: string;
  name: string;
  nature: ChartAccountNature;
  accountKind: ChartAccountKind;
  allowPosting: boolean;
  isResultAccount: boolean;
  dreGroup: ChartAccountDreGroup | null;
  active: boolean;
  sortOrder: number;
};