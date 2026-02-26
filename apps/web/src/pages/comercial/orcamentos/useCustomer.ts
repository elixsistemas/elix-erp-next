// src/pages/comercial/orcamentos/useCustomer.ts
import React from "react";

export type CustomerData = {
  id:       number;
  name:     string;
  document: string | null;
  email:    string | null;
  phone:    string | null;

  // cobrança — nomes reais do banco
  billing_address_line1: string | null;
  billing_address_line2: string | null;
  billing_district:      string | null;
  billing_city:          string | null;
  billing_state:         string | null;
  billing_zip_code:      string | null;
  billing_country:       string | null;

  // entrega — nomes reais do banco
  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
  shipping_district:      string | null;
  shipping_city:          string | null;
  shipping_state:         string | null;
  shipping_zip_code:      string | null;
  shipping_country:       string | null;
};

export function useCustomer(customerId: number | null) {
  const [customer, setCustomer] = React.useState<CustomerData | null>(null);
  const token = localStorage.getItem("token") ?? "";

  React.useEffect(() => {
    if (!customerId) { setCustomer(null); return; }
    fetch(`http://localhost:3333/customers/${customerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setCustomer)
      .catch(() => setCustomer(null));
  }, [customerId, token]);

  return customer;
}
