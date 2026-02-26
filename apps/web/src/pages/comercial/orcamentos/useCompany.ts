// src/hooks/useCompany.ts
import React from "react";

export type CompanyData = {
  name:        string;
  legal_name:  string | null;
  cnpj:        string | null;
  address_line1: string | null;
  city:        string | null;
  state:       string | null;
  zip_code:    string | null;
  phone:       string | null;
  email:       string | null;
  logo_base64: string | null;
};

export function useCompany() {
  const [company, setCompany] = React.useState<CompanyData | null>(null);
  const token = localStorage.getItem("token") ?? "";

  React.useEffect(() => {
    fetch("http://localhost:3333/companies/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setCompany)
      .catch(() => setCompany(null));
  }, [token]);

  return company;
}
