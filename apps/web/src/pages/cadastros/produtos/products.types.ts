export type ProductKind = "product" | "service";

export type Product = {
  id: number;
  company_id: number;

  name: string;
  sku?: string | null;

  kind: ProductKind;

  description?: string | null;
  uom?: string | null;

  ncm?: string | null;
  ncm_id?: number | null;
  ean?: string | null;
  cest?: string | null;
  fiscal_json?: string | null;

  price: number;
  cost: number;

  track_inventory?: boolean | null;
  active: boolean;

  image_url?: string | null;

  weight_kg?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  length_cm?: number | null;

  created_at: string;
  updated_at?: string | null;
};

export type ProductCreate = {
  name: string;
  sku?: string | null;
  kind?: ProductKind;

  description?: string | null;
  uom?: string | null;

  ncm?: string | null;
  ncm_id?: number | null;
  ean?: string | null;
  cest?: string | null;
  fiscal_json?: string | null;

  price?: number;
  cost?: number;

  track_inventory?: boolean | null;
  active?: boolean | null;

  image_url?: string | null;

  weight_kg?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  length_cm?: number | null;
};

export type ProductUpdate = Partial<ProductCreate>;

export type ListProductsQuery = {
  q?: string;
  limit?: number;
  active?: 0 | 1;
  kind?: ProductKind;
};

export type ProductStockResponse = {
  productId: number;
  stock: number;
};
