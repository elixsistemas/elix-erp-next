// src/pages/comercial/orcamentos/quotes.types.ts

// ─── Status ──────────────────────────────────────────────────────────────────
export type QuoteStatus = "draft" | "approved" | "cancelled";

// ─── Row retornado pelo backend (GET /quotes/:id) ────────────────────────────
// Adicione estes campos em QuoteRow:
export type QuoteRow = {
  id:          number;
  company_id:  number;
  customer_id: number;
  status:      QuoteStatus;

  subtotal:      number;
  discount:      number;
  freight_value: number | null;    // ← melhoria 7
  total:         number;

  notes:          string | null;
  internal_notes: string | null;   // ← melhoria 9
  valid_until:    string | null;   // ← melhoria 1

  payment_terms:     string | null;  // ← melhoria 2
  payment_method:    string | null;  // ← melhoria 2
  expected_delivery: string | null;  // ← melhoria 2

  seller_id:   number | null;      // ← melhoria 4
  seller_name: string | null;      // ← melhoria 4

  created_at:   string;
  updated_at:   string | null;
  approved_at:  string | null;
  cancelled_at: string | null;
};

// QuoteListRow — adicionar joins do cliente
export type QuoteListRow = QuoteRow & {
  customer_name:     string;
  customer_document: string | null;
};

// QuoteItemRow — adicionar unit
export type QuoteItemRow = {
  id:          number;
  quote_id:    number;
  product_id:  number;
  description: string;
  quantity:    number;
  unit_price:  number;
  total:       number;
  unit:        string | null;   // ← melhoria 8

  product_name?: string;
  product_sku?:  string | null;  // ← código/SKU (melhoria 3)
  product_kind?: "product" | "service" | string;
  product_uom?:  string | null;
};

// ─── Detalhe completo (quote + items) ────────────────────────────────────────
export type QuoteDetails = {
  quote: QuoteRow;
  items: QuoteItemRow[];
};

// ─── Payload para criar/editar item ─────────────────────────────────────────
export type QuoteItemUpsert = {
  productId:   number;
  description: string;
  quantity:    number;
  unitPrice:   number;
  unit?:       string | null;   // ← melhoria 8
};

// ─── Payload de criação ───────────────────────────────────────────────────────
export type QuoteCreate = {
  customerId:   number;
  discount?:    number;
  notes?:       string | null;

  // novos campos (melhorias)
  validUntil?:       string | null;   // ← 1
  paymentTerms?:     string | null;   // ← 2
  paymentMethod?:    string | null;   // ← 2
  expectedDelivery?: string | null;   // ← 2
  freightValue?:     number;          // ← 7
  internalNotes?:    string | null;   // ← 9
  sellerId?:         number | null;   // ← 4
  sellerName?:       string | null;   // ← 4

  items:            QuoteItemUpsert[];
};

// ─── Payload de atualização (todos opcionais) ────────────────────────────────
export type QuoteUpdate = Partial<{
  customerId:       number;
  discount:         number;
  subtotal:         number;
  total:            number;
  notes:            string | null;

  // novos campos (melhorias)
  validUntil:       string | null;   // ← 1
  paymentTerms:     string | null;   // ← 2
  paymentMethod:    string | null;   // ← 2
  expectedDelivery: string | null;   // ← 2
  freightValue:     number;          // ← 7
  internalNotes:    string | null;   // ← 9
  sellerId:         number | null;   // ← 4
  sellerName:       string | null;   // ← 4

  items: QuoteItemUpsert[];
}>;

// ─── Filtros da listagem ──────────────────────────────────────────────────────
export type QuoteListQuery = Partial<{
  q:          string;
  status:     QuoteStatus;
  from:       string;       // yyyy-mm-dd
  to:         string;       // yyyy-mm-dd
  customerId: number;
  limit:      number;
}>;

// ─── Combobox helpers ─────────────────────────────────────────────────────────
export type CustomerMini = {
  id:          number;
  name:        string;
  document:    string;
  email?:      string | null;
  phone?:      string | null;
  person_type?: "PF" | "PJ" | null;
};

export type ProductMini = {
  id:          number;
  name:        string;
  sku?:        string | null;
  kind:        "product" | "service";
  price:       number;
  uom?:        string | null;
  unit?:       string | null;   // ← melhoria 8 (alias de uom no frontend)
  description?: string | null;
  ean?:        string | null;
  ncm?:        string | null;
  active:      boolean;
};
