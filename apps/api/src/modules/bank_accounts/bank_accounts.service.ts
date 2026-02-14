import * as repo from "./bank_accounts.repository";

export function list(companyId: number) {
  return repo.listBankAccounts(companyId);
}

export function get(companyId: number, id: number) {
  return repo.getBankAccount(companyId, id);
}

export function create(args: {
  companyId: number;
  bankCode: string;
  name: string;
  agency?: string | null;
  account?: string | null;
  accountDigit?: string | null;
  convenio?: string | null;
  wallet?: string | null;
  settings?: any | null;
  active?: boolean;
}) {
  return repo.createBankAccount(args);
}

export function update(args: {
  companyId: number;
  id: number;
  bankCode?: string;
  name?: string;
  agency?: string | null;
  account?: string | null;
  accountDigit?: string | null;
  convenio?: string | null;
  wallet?: string | null;
  settings?: any | null;
  active?: boolean;
}) {
  return repo.updateBankAccount(args);
}

export function remove(companyId: number, id: number) {
  return repo.softDeleteBankAccount(companyId, id);
}
