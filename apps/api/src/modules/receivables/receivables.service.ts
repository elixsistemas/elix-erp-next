import {
  createReceivableFromSale,
  listReceivables,
  getReceivable,
  payReceivable,
  cancelReceivable
} from "./receivables.repository";

export type CreateFromSaleResult =
  | { data: any }
  | { error: "SALE_NOT_FOUND" | "RECEIVABLE_ALREADY_EXISTS" };
  
export async function createFromSale(args: {
  companyId: number;
  saleId: number;
  bankAccountId: number;
  dueDate: string;
  documentNo: string | null;
  note: string | null;
}) {
  return createReceivableFromSale(args);
}

export function list(companyId: number) {
  return listReceivables(companyId);
}

export function get(companyId: number, id: number) {
  return getReceivable(companyId, id);
}

export function pay(companyId: number, id: number) {
  return payReceivable({ companyId, id });
}

export function cancel(companyId: number, id: number) {
  return cancelReceivable({ companyId, id });
}
