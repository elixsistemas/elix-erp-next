export type MovementType = "IN" | "OUT" | "ADJUST_POS" | "ADJUST_NEG";

export type MovementReason =
  | "SALE"
  | "PURCHASE_XML"
  | "MANUAL"
  | "ADJUST"
  | "INVENTORY"
  | "TRANSFER"
  | "RETURN";

export type InventoryStockRow = {
  product_id: number;
  name: string;
  sku: string | null;
  kind: "product" | "service" | "consumable" | "kit";
  uom: string | null;
  active: boolean;
  on_hand: number;
  last_movement_at: string | null;
};

export type InventoryStockResponse = {
  productId: number;
  onHand: number;
};

export type InventoryMovementRow = {
  id: number;
  company_id: number;
  product_id: number;
  type: MovementType;
  quantity: number;
  source: string | null;
  source_id: number | null;
  source_type?: string | null;
  reason?: string | null;
  note: string | null;
  created_at: string;
};

export type ProductMini = {
  id: number;
  name: string;
  sku?: string | null;
};