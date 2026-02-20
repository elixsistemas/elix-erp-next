export type Company = {
  id: number;
  name: string;

  cnpj?: string | null;

  legal_name?: string | null;
  trade_name?: string | null;
  ie?: string | null;
  im?: string | null;

  email?: string | null;
  phone?: string | null;
  website?: string | null;

  address_line1?: string | null;
  address_line2?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string | null;

  default_bank_account_id?: number | null;

  allow_negative_stock?: boolean | null;
  is_active?: boolean | null;

  created_at?: string;
  updated_at?: string | null;
};

export type CompanyUpdate = Partial<Pick<
  Company,
  | "name"
  | "cnpj"
  | "legal_name"
  | "trade_name"
  | "ie"
  | "im"
  | "email"
  | "phone"
  | "website"
  | "address_line1"
  | "address_line2"
  | "district"
  | "city"
  | "state"
  | "zip_code"
  | "country"
  | "default_bank_account_id"
  | "allow_negative_stock"
  | "is_active"
>>;

export type BankAccountRow = {
  id: number;
  name?: string | null;
  bank_name?: string | null;
  agency?: string | null;
  account_number?: string | null;
  is_active?: boolean | null;
};
