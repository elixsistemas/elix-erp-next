import * as repo from "./bank_accounts.repository";

export function create(args: any) {
  return repo.createBankAccount(args);
}

export function list(companyId: number) {
  return repo.listBankAccounts(companyId);
}

export function update(args: any) {
  return repo.updateBankAccount(args);
}

export function desativar(companyId: number, id: number) {
  return repo.deactivateBankAccount(companyId, id);
}

export function activate(companyId: number, id: number) {
  return repo.activateBankAccount(companyId, id);
}
