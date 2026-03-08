export type Carrier = {
  id: number;
  company_id: number;

  code: string | null;
  name: string;
  legal_name: string | null;
  document: string | null;
  state_registration: string | null;
  rntrc: string | null;

  email: string | null;
  phone: string | null;
  contact_name: string | null;

  zip_code: string | null;
  street: string | null;
  street_number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;

  vehicle_type: string | null;
  plate: string | null;

  notes: string | null;
  active: boolean;

  created_at: string;
  updated_at: string;
};

export type CarrierFormValues = {
  code: string;
  name: string;
  legal_name: string;
  document: string;
  state_registration: string;
  rntrc: string;

  email: string;
  phone: string;
  contact_name: string;

  zip_code: string;
  street: string;
  street_number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;

  vehicle_type: string;
  plate: string;

  notes: string;
  active: boolean;
};