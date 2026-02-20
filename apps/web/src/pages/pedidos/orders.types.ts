// apps/web/src/pages/pedidos/orders.types.ts
export type OrderStatus = "draft" | "billed" | "cancelled";

export type OrderRow = {
  id: number;
  company_id: number;
  customer_id: number;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  notes: string | null;
  created_at: string;
  billed_at: string | null;
};

export type OrderItemRow = {
  id: number;
  order_id: number;
  product_id: number;
  kind: "product" | "service";
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
};

export type OrderDetails = {
  order: OrderRow;
  items: OrderItemRow[];
};

export type BillOrderResult = {
  orderId?: number;
  saleId: number;
};
