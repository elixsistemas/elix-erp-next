export type CostCenter = {
  id: number;
  company_id: number;
  code: string;
  name: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CostCenterListParams = {
  q?: string;
  active?: "1" | "0" | "";
};

export type CostCenterFormData = {
  code: string;
  name: string;
  active: boolean;
  sortOrder: number;
};