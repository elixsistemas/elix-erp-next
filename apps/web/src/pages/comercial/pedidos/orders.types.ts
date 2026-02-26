export type OrderStatus = "draft" | "confirmed" | "cancelled";

export type OrderRow = {
  id: number; companyId: number; customerId: number;
  quoteId: number | null; sellerId: number | null;
  status: OrderStatus;
  subtotal: number; discount: number; total: number;
  freightValue:  number | null;   // ← melhoria 7
  internalNotes: string | null;   // ← melhoria 9
  sellerName: string | null; paymentTerms: string | null;
  paymentMethod: string | null; transportMode: string | null;
  expectedDelivery: string | null;
  deliveryZipcode: string | null; deliveryStreet: string | null;
  deliveryNumber: string | null; deliveryComplement: string | null;
  deliveryNeighborhood: string | null; deliveryCity: string | null;
  deliveryState: string | null;
  notes: string | null;
  createdAt: string; updatedAt: string | null;
  confirmedAt: string | null; cancelledAt: string | null;
  customerName?: string;
};

export type OrderItemRow = {
  id: number; orderId: number; productId: number | null;
  description: string;
  unit:        string | null;   // ← melhoria 8
  quantity: number; unitPrice: number; total: number;
};

export type OrderCreate = {
  customerId:           number;
  sellerId?:            number | null;
  discount?:            number;
  freightValue?:        number;          // ← melhoria 7
  internalNotes?:       string | null;   // ← melhoria 9
  paymentTerms?:        string | null;
  paymentMethod?:       string | null;
  transportMode?:       string | null;
  expectedDelivery?:    string | null;
  deliveryZipcode?:     string | null;
  deliveryStreet?:      string | null;
  deliveryNumber?:      string | null;
  deliveryComplement?:  string | null;
  deliveryNeighborhood?: string | null;
  deliveryCity?:        string | null;
  deliveryState?:       string | null;
  notes?:               string | null;
  items: OrderItemUpsert[];
};

export type OrderItemUpsert = {
  productId?:  number | null;
  description: string;
  unit?:       string | null; 
  quantity:    number;
  unitPrice:   number;
};

export type OrderUpdate = Partial<Omit<OrderCreate, "quoteId">>;
