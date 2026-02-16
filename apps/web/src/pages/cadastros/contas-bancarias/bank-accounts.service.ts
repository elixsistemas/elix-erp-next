// bank-accounts.service.ts
import { api } from "@/shared/api/client";
import type { BankAccount } from "./bank-accounts.types";

export async function listBankAccounts() {
  const data = await api("/bank-accounts", { auth: true });
  return Array.isArray(data) ? (data as BankAccount[]) : [];
}

export async function createBankAccount(payload: any) {
  return api("/bank-accounts", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function updateBankAccount(id: number, payload: any) {
  return api(`/bank-accounts/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function deactivateBankAccount(id: number) {
  return api(`/bank-accounts/${id}`, {
    method: "DELETE",
    auth: true,
  });
}
