export type ProductCategory = {
  id: number;
  company_id: number;
  parent_id: number | null;
  code: string;
  name: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductCategoryNode = ProductCategory & {
  children: ProductCategoryNode[];
};

export type ProductCategoryListParams = {
  q?: string;
  active?: "1" | "0" | "";
};

export type ProductCategoryFormData = {
  parentId: number | null;
  code: string;
  name: string;
  active: boolean;
  sortOrder: number;
};