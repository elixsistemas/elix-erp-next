export type Customer = {
  id: number;
  name: string;
  document: string;      // obrigatório no backend
  email?: string | null;
  phone?: string | null;
  created_at: string;    // se existir no retorno
};

export type CustomerCreate = {
  name: string;
  document: string;
  email?: string | null;
  phone?: string | null;
};

export type CustomerUpdate = Partial<CustomerCreate> & { id: number };
