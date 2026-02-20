import { api } from "@/shared/api/client";
import type { BankAccountRow, Company, CompanyUpdate } from "./company.types";

export function getMyCompany() {
  return api<Company>("/companies/me");
}

export function updateMyCompany(body: CompanyUpdate) {
  return api<Company>("/companies/me", { method: "PATCH", body });
}

export function listBankAccounts() {
  return api<BankAccountRow[]>("/bank-accounts");
}
