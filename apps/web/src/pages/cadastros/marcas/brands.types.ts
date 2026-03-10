export type Brand = {
  id: number;
  company_id: number;
  code: string;
  name: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type BrandListParams = {
  q?: string;
  active?: "1" | "0" | "";
};

export type BrandFormData = {
  code: string;
  name: string;
  active: boolean;
  sortOrder: number;
};