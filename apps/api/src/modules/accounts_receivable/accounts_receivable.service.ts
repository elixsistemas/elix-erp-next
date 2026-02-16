import * as repo from "./accounts_receivable.repository";

export function list(companyId: number) {
  return repo.listReceivables(companyId);
}

export async function getBySale(companyId: number, saleId: number) {
  const rec = await repo.getReceivableBySale(companyId, saleId);
  if (!rec) return { error: "NOT_FOUND" as const };
  return { data: rec };
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
  const sale = await repo.getReceivableBySale(args.companyId, args.saleId);
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

if ("error" in created) {
  return { error: "RECEIVABLE_ALREADY_EXISTS" as const };
}

    return { data: created };
}

export async function issueMock(companyId: number, id: number) {
  return repo.issueReceivableMock({ companyId, id });
}
