import * as repo from "./orders.repository";

export async function list(args: {
  companyId: number;
  from?: string;
  to?: string;
  customerId?: number;
  status?: string;
}) {
  return repo.listOrders(args);
}

export async function get(companyId: number, orderId: number) {
  return repo.getOrderWithItems(companyId, orderId);
}

export async function create(args: {
  companyId: number;
  quoteId?: number | null;
  customerId: number;
  status?: string;
  subtotal: number;
  discount: number;
  total: number;
  notes?: string | null;
  items: Array<{
    productId: number;
    kind: "product" | "service";
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}) {
  // ✅ valida quoteId aqui dentro (onde args existe)
  if (args.quoteId) {
    const ok = await repo.quoteBelongsToCompany({
      companyId: args.companyId,
      quoteId: args.quoteId,
    });

    if (!ok) {
      return { error: "QUOTE_NOT_FOUND" as const };
    }
  }

  const created = await repo.createOrderTx(args);
  return { data: created };
}

export async function update(args: {
  companyId: number;
  orderId: number;
  status?: string;
  notes?: string | null;
}) {
  const updated = await repo.updateOrder(args);
  if (!updated) return { error: "ORDER_NOT_FOUND" as const };
  return { data: updated };
}

export async function cancel(args: { companyId: number; orderId: number }) {
  const updated = await repo.cancelOrder(args);
  if (!updated) return { error: "ORDER_NOT_FOUND_OR_BILLED" as const };
  return { data: updated };
}

export async function billToSale(args: { companyId: number; orderId: number }) {
  const res = await repo.billOrderToSaleTx(args);
  return res; // já retorna {error} ou {data:{sale,items}}
}