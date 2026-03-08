import * as repo from "./bank_accounts.repository";

type BankAccountPayload = {
  companyId: number;
  id?: number;
  bankCode: string;
  name: string;
  agency?: string | null;
  account?: string | null;
  accountDigit?: string | null;
  convenio?: string | null;
  wallet?: string | null;
  settingsJson?: string | null;

  accountType?: string | null;
  bankName?: string | null;
  bankIspb?: string | null;
  branchDigit?: string | null;
  holderName?: string | null;
  holderDocument?: string | null;
  pixKeyType?: string | null;
  pixKeyValue?: string | null;
  isDefault?: boolean;
  allowReceipts?: boolean;
  allowPayments?: boolean;
  reconciliationEnabled?: boolean;
  externalCode?: string | null;
  notes?: string | null;
};

export function create(args: BankAccountPayload) {
  return repo.createBankAccount(args);
}

export function list(companyId: number, active?: boolean) {
  return repo.listBankAccounts(companyId, active);
}

export function update(args: BankAccountPayload & { id: number }) {
  return repo.updateBankAccount(args);
}

export function desativar(companyId: number, id: number) {
  return repo.deactivateBankAccount(companyId, id);
}

export function activate(companyId: number, id: number) {
  return repo.activateBankAccount(companyId, id);
}