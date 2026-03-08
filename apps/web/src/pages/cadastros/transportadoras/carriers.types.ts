export type Carrier = {
  id: number;
  company_id: number;
  code: string | null;

  legal_name: string;
  trade_name: string | null;

  document_type: "CPF" | "CNPJ";
  document_number: string;

  state_registration: string | null;
  municipal_registration: string | null;
  rntrc: string | null;

  email: string | null;
  phone: string | null;
  contact_name: string | null;

  zip_code: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  district: string | null;
  city: string | null;
  state: string | null;

  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CarrierFormValues = {
  code: string;

  legalName: string;
  tradeName: string;

  documentType: "CPF" | "CNPJ";
  documentNumber: string;

  stateRegistration: string;
  municipalRegistration: string;
  rntrc: string;

  email: string;
  phone: string;
  contactName: string;

  zipCode: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;

  notes: string;
  active: boolean;
};