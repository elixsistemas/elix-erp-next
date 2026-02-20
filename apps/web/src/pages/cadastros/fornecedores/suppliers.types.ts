export type SupplierPersonType = "PF" | "PJ";

export type Supplier = {
  id: number;
  company_id: number;

  name: string;
  document: string;

  person_type?: SupplierPersonType | null;
  ie?: string | null;

  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  contact_name?: string | null;

  notes?: string | null;

  is_active?: boolean | null;
  deleted_at?: string | null;

  billing_address_line1?: string | null;
  billing_address_line2?: string | null;
  billing_district?: string | null;
  billing_city?: string | null;
  billing_state?: string | null;
  billing_zip_code?: string | null;
  billing_country?: string | null;

  shipping_address_line1?: string | null;
  shipping_address_line2?: string | null;
  shipping_district?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_zip_code?: string | null;
  shipping_country?: string | null;

  created_at: string;
  updated_at?: string | null;
};

export type SupplierCreate = {
  name: string;
  document: string;

  person_type?: SupplierPersonType | null;
  ie?: string | null;

  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  contact_name?: string | null;

  notes?: string | null;

  billing_address_line1?: string | null;
  billing_address_line2?: string | null;
  billing_district?: string | null;
  billing_city?: string | null;
  billing_state?: string | null;
  billing_zip_code?: string | null;
  billing_country?: string | null;

  shipping_address_line1?: string | null;
  shipping_address_line2?: string | null;
  shipping_district?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_zip_code?: string | null;
  shipping_country?: string | null;
};

export type SupplierUpdate = Partial<SupplierCreate>;

export type ListSuppliersQuery = {
  q?: string;
  limit?: number;
  active?: 0 | 1;
};
