export type QuoteStatus = "draft" | "approved" | "cancelled";

export type QuoteRow = {
  id: number;
  company_id: number;
  customer_id: number;
  status: QuoteStatus;
  subtotal: number;
  discount: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at?: string | null;
  approved_at?: string | null;
  cancelled_at?: string | null;
};

export type QuoteListRow = QuoteRow & {
  customer_name: string;
  customer_document: string;
};

export type QuoteItemRow = {
  id: number;
  quote_id: number;
  product_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;

  product_name?: string;
  product_sku?: string | null;
  product_kind?: "product" | "service" | string;
  product_uom?: string | null;
};

export type QuoteDetails = {
  quote: QuoteRow;
  items: QuoteItemRow[];
};

export type QuoteItemUpsert = {
  productId: number;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type QuoteCreate = {
  customerId: number;
  discount?: number;
  notes?: string | null;
  items: QuoteItemUpsert[];
};

export type QuoteUpdate = Partial<{
  customerId: number;
  discount: number;
  notes: string | null;
  items: QuoteItemUpsert[];
}>;

export type QuoteListQuery = Partial<{
  q: string;
  status: QuoteStatus;
  from: string;     // yyyy-mm-dd
  to: string;       // yyyy-mm-dd
  customerId: number;
  limit: number;
}>;

// Para combobox
export type CustomerMini = {
  id: number;
  name: string;
  document: string;
  email?: string | null;
  phone?: string | null;
  person_type?: "PF" | "PJ" | null;
};

export type ProductMini = {
  id: number;
  name: string;
  sku?: string | null;
  kind: "product" | "service";
  price: number;
  uom?: string | null;
  description?: string | null;
  ean?: string | null;
  ncm?: string | null;
  active: boolean;
};
