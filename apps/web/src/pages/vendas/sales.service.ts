import { api } from "@/shared/api/client";
import type {
  BankAccountRow,
  CloseSaleBody,
  CloseSaleResult,
  FiscalDoc,
  PaymentTermRow,
  PreviewInstallmentsResponse,
  SaleDetails,
  SaleRow,
  SaleStatus,
} from "./sales.types";

export async function listSales(params: {
  from?: string;
  to?: string;
  customerId?: number;
  status?: SaleStatus;
}) {
  const qs = new URLSearchParams();
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.customerId) qs.set("customerId", String(params.customerId));
  if (params.status) qs.set("status", params.status);

  const q = qs.toString();
  return api<SaleRow[]>(`/sales${q ? `?${q}` : ""}`);
}

export function getSale(id: number) {
  return api<SaleDetails>(`/sales/${id}`);
}

export function patchSale(
  id: number,
  body: Partial<{
    paymentMethodId: number | null;
    paymentTermId: number | null;
    notes: string | null;
    discount: number;
  }>
) {
  return api<SaleRow>(`/sales/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function listSaleFiscal(id: number) {
  return api<{ documents: FiscalDoc[] }>(`/sales/${id}/fiscal`);
}

export function issueSaleFiscal(saleId: number, type: "NFE" | "NFSE" | "BOTH") {
  return api(`/sales/${saleId}/fiscal/issue`, {
    method: "POST",
    body: JSON.stringify({ type }),
  });
}

export function previewInstallments(saleId: number) {
  return api<PreviewInstallmentsResponse>(`/sales/${saleId}/installments/preview`, {
    method: "POST",
  });
}

export function closeSale(saleId: number, body: CloseSaleBody) {
  return api<CloseSaleResult>(`/sales/${saleId}/close`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function listBankAccounts() {
  return api<BankAccountRow[]>(`/bank-accounts`);
}

export function listPaymentTerms() {
  return api<PaymentTermRow[]>(`/payment-terms`);
}
