import * as repo from "./accounts_payable.repository";
import type {
  AccountsPayableCreate,
  AccountsPayableListQuery,
  AccountsPayableStatusUpdate,
  AccountsPayableUpdate,
} from "./accounts_payable.schema";

export async function createAccountsPayable(
  companyId: number,
  data: AccountsPayableCreate,
) {
  return repo.createAccountsPayable(companyId, data);
}

export async function updateAccountsPayable(
  companyId: number,
  id: number,
  data: AccountsPayableUpdate,
) {
  return repo.updateAccountsPayable(companyId, id, data);
}

export async function updateAccountsPayableStatus(
  companyId: number,
  id: number,
  data: AccountsPayableStatusUpdate,
) {
  return repo.updateAccountsPayableStatus(companyId, id, data.status);
}

export async function getAccountsPayableById(companyId: number, id: number) {
  return repo.getAccountsPayableById(companyId, id);
}

export async function listAccountsPayable(
  companyId: number,
  query: AccountsPayableListQuery,
) {
  return repo.listAccountsPayable(companyId, query);
}