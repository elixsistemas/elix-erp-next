// src/pages/comercial/vendas/sales.types.ts
export type SaleStatus = "draft" | "completed" | "cancelled";

export type SaleRow = {
  id: number; companyId: number; customerId: number;
  quoteId: number | null; orderId: number | null; sellerId: number | null;
  status: SaleStatus;
  subtotal: number; discount: number; total: number;
  sellerName:    string | null;
  paymentTerms:  string | null;
  paymentMethod: string | null;
  notes:         string | null;
  // ── melhorias ──────────────────────────────────
  freightValue:     number | null;   // melhoria 7
  internalNotes:    string | null;   // melhoria 9
  expectedDelivery: string | null;   // melhoria 2
  transportMode:    string | null;   // melhoria 2
  // endereço de entrega
  deliveryStreet:       string | null;
  deliveryNumber:       string | null;
  deliveryComplement:  string | null;
  deliveryNeighborhood: string | null;
  deliveryCity:         string | null;
  deliveryState:        string | null;
  deliveryZipcode:     string | null; 
  // ───────────────────────────────────────────────
  createdAt: string; updatedAt: string | null;
  completedAt: string | null; cancelledAt: string | null;
  customerName?: string;
};

export type SaleItemRow = {
  id: number; saleId: number; productId: number | null;
  description: string;
  unit:       string | null;   // melhoria 8
  productSku: string | null;   // melhoria 3
  quantity:   number;
  unitPrice:  number;
  total:      number;
};

export type SaleCreate = {
  customerId:    number;
  quoteId?:      number | null;
  orderId?:      number | null;
  sellerId?:     number | null;
  discount?:     number;
  freightValue?: number | null;
  internalNotes?: string | null;
  paymentTerms?: string | null;
  paymentMethod?: string | null;
  expectedDelivery?: string | null;
  transportMode?: string | null;
  deliveryStreet?: string | null;
  deliveryNumber?: string | null;
  deliveryComplement?: string | null;
  deliveryNeighborhood?: string | null;
  deliveryCity?: string | null;
  deliveryState?: string | null;
  deliveryZipcode?: string | null;
  notes?:        string | null;
  items: {
    productId?:  number | null;
    description: string;
    unit?:       string | null;
    quantity:    number;
    unitPrice:   number;
  }[];
};

export type SaleUpdate = Partial<Omit<SaleCreate, "quoteId" | "orderId">>;
