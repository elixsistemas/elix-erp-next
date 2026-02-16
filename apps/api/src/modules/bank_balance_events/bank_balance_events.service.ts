import * as repo from "./bank_balance_events.repository";
import type { BankBalanceEventListQuery } from "./bank_balance_events.schemas";

export function create(args: any) {
  return repo.createBankBalanceEvent(args);
}

export function list(companyId: number, query: BankBalanceEventListQuery) {
  return repo.listBankBalanceEvents(companyId, query);
}

export function remove(companyId: number, id: number) {
  return repo.deleteBankBalanceEvent(companyId, id);
}
