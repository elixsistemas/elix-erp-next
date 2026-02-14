import * as repo from "./accounts_receivable.repository";

export function list(companyId: number) {
  return repo.listReceivables(companyId);
}

export function get(companyId: number, id: number) {
  return repo.getReceivable(companyId, id);
}

export function create(args: {
  companyId: number;
  customerId: number;
  saleId: number | null;
  bankAccountId: number;
  dueDate: string;
  amount: number;
  documentNo: string | null;
  note: string | null;
}) {
  return repo.createReceivable(args);
}

export function update(args: {
  companyId: number;
  id: number;
  dueDate?: string;
  documentNo?: string | null;
  note?: string | null;
}) {
  return repo.updateReceivable(args);
}

export async function cancel(companyId: number, id: number) {
  return repo.cancelReceivable({ companyId, id });
}

export async function createFromSale(args: {
  companyId: number;
  saleId: number;
  bankAccountId: number;
  dueDate: string;
  documentNo: string | null;
  note: string | null;
}) {
  const sale = await repo.getSaleForReceivable(args.companyId, args.saleId);
  if (!sale) return { error: "SALE_NOT_FOUND" as const };

  const created = await repo.createReceivableFromSale({
    companyId: args.companyId,
    saleId: Number(sale.id),
    customerId: Number(sale.customer_id),
    bankAccountId: args.bankAccountId,
    dueDate: args.dueDate,
    amount: Number(sale.total),
    documentNo: args.documentNo,
    note: args.note
  });

  return { data: created };
}

export async function issueMock(companyId: number, id: number) {
  return repo.issueReceivableMock({ companyId, id });
}
