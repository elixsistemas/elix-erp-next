import { api } from "@/shared/api/client";
import type { BankAccount } from "./bank-accounts.types";

export async function listBankAccounts(active?: "1" | "0") {
  const suffix = active ? `?active=${active}` : "";
  const data = await api(`/bank-accounts${suffix}`, { auth: true });
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

export async function activateBankAccount(id: number) {
  return api(`/bank-accounts/${id}/activate`, {
    method: "PATCH",
    auth: true,
  });
}