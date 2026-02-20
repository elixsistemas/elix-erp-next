export type QuoteStatus = "draft" | "approved" | "cancelled";

export type QuoteRow = {
  id: number;
  company_id?: number;
  customer_id: number;
  status: QuoteStatus | string;
  subtotal: number;
  discount: number;
  total: number;
  notes: string | null;
  created_at: string;
};

export type QuoteItemRow = {
  id: number;
  quote_id: number;
  product_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
};

export type QuoteDetails = {
  quote: QuoteRow;
  items: QuoteItemRow[];
};

export type CreateQuoteBody = {
  customerId: number;
  discount?: number;
  notes?: string | null;
  items: Array<{
    productId: number;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
};

export type OrderCreateFromQuoteResult = {
  orderId: number;
};

export type SaleCreateFromQuoteResult = {
  saleId: number;
};
