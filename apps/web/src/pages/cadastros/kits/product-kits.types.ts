export type ProductKitRow = {
  id: number;
  company_id: number;
  name: string;
  sku?: string | null;
  kind: "kit";
  active: boolean;
  created_at: string;
  updated_at?: string | null;
};

export type ProductKitComponent = {
  id: number;
  company_id: number;
  kit_product_id: number;
  component_product_id: number;
  quantity: number;
  sort_order: number;
  created_at: string;
  updated_at?: string | null;

  component_name: string;
  component_sku?: string | null;
  component_kind: "product" | "service" | "consumable" | "kit";
  component_active: boolean;
};

export type ProductKitDetails = ProductKitRow & {
  items: ProductKitComponent[];
};

export type ProductKitUpsertItem = {
  componentProductId: number;
  quantity: number;
  sortOrder: number;
};

export type ProductKitUpsertPayload = {
  kitProductId: number;
  items: ProductKitUpsertItem[];
};