export type Company = {
  id: number;
  name: string;
  cnpj: string | null;
  created_at: string;
};

export type CompanyCreate = {
  name: string;
  cnpj?: string | null;
};

export type CompanyUpdate = {
  id: number;
  name: string;
  cnpj?: string | null;
};

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};
