export type FiscalFixed = {
  id: number;
  code: string;
  description: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Cest = {
  id: number;
  code: string;
  description: string;
  segment: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Uom = {
  id: number;
  code: string;
  description: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CestUpsert = {
  code: string;
  description: string;
  segment: string | null;
  active?: boolean;
};

export type PagedResult<T> = {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
};

export type ListFiscalQuery = {
  search?: string;          
  active?: "1" | "0";       
  page?: number;
  pageSize?: number;
};

export type Cfop = {
  id: number;
  code: string;
  description: string;
  nature: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CfopUpsert = {
  code: string;
  description: string;
  nature: number | null;
  active?: boolean;
};

export type Ncm = {
  id: number;
  code: string;
  description: string;
  ex: string | null;
  start_date: string | null; // ISO "YYYY-MM-DD"
  end_date: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type NcmUpsert = {
  code: string;
  description: string;
  ex?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  active?: boolean;
};

export type ImportResult = { inserted: number; updated: number; itemsCount?: number };