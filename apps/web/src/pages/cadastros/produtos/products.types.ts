export type Product = {
  id: number;
  name: string;
  sku?: string | null;
  ncm?: string | null;
  ean?: string | null;
  price: number;
  cost: number;
  created_at?: string;
};

export type ProductCreate = {
  name: string;
  sku?: string | null;
  ncm?: string | null;
  ean?: string | null;
  price?: number;
  cost?: number;
};

export type ProductUpdate = {
  id: number;
  name?: string;
  sku?: string | null;
  ncm?: string | null;
  ean?: string | null;
  price?: number;
  cost?: number;
};
