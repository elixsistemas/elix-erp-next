import { api } from "@/shared/api/client";
import type {
  ConfirmImportResponse,
  PurchaseEntryConfirmationPreview,
  PurchaseEntryDetails,
  PurchaseEntryImportDetails,
  PurchaseEntryImportRow,
  PurchaseEntryRow,
  UpdateImportEconomicsPayload,
  UpdateImportFinancialPayload,
  UpdateImportInstallmentPayload,
  UpdateImportItemAllocationPayload,
  UpdateImportItemPayload,
  UpdateImportLogisticsPayload,
  FinancialOptions,
  ProductMini,
  SupplierMini,
} from "./purchase-entry-imports.types";

const BASE = "/purchase-entry-imports";

export async function listPurchaseEntryImports(params?: {
  status?: string;
  q?: string;
  supplierId?: number;
  limit?: number;
  offset?: number;
}): Promise<PurchaseEntryImportRow[]> {
  const search = new URLSearchParams();

  if (params?.status) search.set("status", params.status);
  if (params?.q) search.set("q", params.q);
  if (params?.supplierId) search.set("supplierId", String(params.supplierId));
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.offset) search.set("offset", String(params.offset));

  const url = search.toString() ? `${BASE}?${search.toString()}` : BASE;

  return api(url, {
    method: "GET",
  });
}

export async function getPurchaseEntryImport(
  id: number,
): Promise<PurchaseEntryImportDetails> {
  return api(`${BASE}/${id}`, {
    method: "GET",
  });
}

export async function importPurchaseEntryXml(payload: {
  fileName: string;
  xmlContent: string;
}): Promise<PurchaseEntryImportDetails | { id: number }> {
  return api<PurchaseEntryImportDetails | { id: number }>(`${BASE}/import-xml`, {
    method: "POST",
    body: payload,
  });
}

export async function updatePurchaseEntryFinancial(
  id: number,
  payload: UpdateImportFinancialPayload,
) {
  return api(`${BASE}/${id}/financial`, {
    method: "PUT",
    body: payload,
  });
}

export async function updatePurchaseEntryLogistics(
  id: number,
  payload: UpdateImportLogisticsPayload,
) {
  return api(`${BASE}/${id}/logistics`, {
    method: "PUT",
    body: payload,
  });
}

export async function matchSupplier(id: number, supplierId: number) {
  return api(`${BASE}/${id}/match-supplier`, {
    method: "PUT",
    body: { supplierId },
  });
}

export async function createSupplierFromImport(
  id: number,
  payload?: { overwriteName?: string },
) {
  return api(`${BASE}/${id}/create-supplier`, {
    method: "POST",
    body: payload ?? {},
  });
}

export async function updateImportItem(
  id: number,
  itemId: number,
  payload: UpdateImportItemPayload,
) {
  return api(`${BASE}/${id}/items/${itemId}`, {
    method: "PUT",
    body: payload,
  });
}

export async function matchProduct(
  id: number,
  itemId: number,
  productId: number,
) {
  return api(`${BASE}/${id}/items/${itemId}/match-product`, {
    method: "PUT",
    body: { productId },
  });
}

export async function createProductFromImportItem(
  id: number,
  itemId: number,
  payload?: {
    overwriteName?: string;
    kind?: "product" | "service";
    trackInventory?: boolean;
  },
) {
  return api(`${BASE}/${id}/items/${itemId}/create-product`, {
    method: "POST",
    body: payload ?? {},
  });
}

export async function updateImportInstallment(
  id: number,
  installmentId: number,
  payload: UpdateImportInstallmentPayload,
) {
  return api(`${BASE}/${id}/installments/${installmentId}`, {
    method: "PUT",
    body: payload,
  });
}

export async function confirmPurchaseEntryImport(
  id: number,
): Promise<ConfirmImportResponse> {
  return api(`${BASE}/${id}/confirm`, {
    method: "POST",
  });
}

export async function cancelPurchaseEntryImport(id: number) {
  return api(`${BASE}/${id}/cancel`, {
    method: "PATCH",
  });
}

export async function getFinancialOptions(): Promise<FinancialOptions> {
  return api<FinancialOptions>(`${BASE}/financial-options`, {
    method: "GET",
  });
}

export async function listPurchaseEntrySuppliersMini(): Promise<SupplierMini[]> {
  return api<SupplierMini[]>(`${BASE}/suppliers-mini`, {
    method: "GET",
  });
}

export async function listPurchaseEntryProductsMini(): Promise<ProductMini[]> {
  return api<ProductMini[]>(`${BASE}/products-mini`, {
    method: "GET",
  });
}

export async function listPurchaseEntries(params?: {
  status?: string;
  q?: string;
  supplierId?: number;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}): Promise<PurchaseEntryRow[]> {
  const search = new URLSearchParams();

  if (params?.status) search.set("status", params.status);
  if (params?.q) search.set("q", params.q);
  if (params?.supplierId) search.set("supplierId", String(params.supplierId));
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.offset) search.set("offset", String(params.offset));

  const url = search.toString()
    ? `${BASE}/entries?${search.toString()}`
    : `${BASE}/entries`;

  return api<PurchaseEntryRow[]>(url, {
    method: "GET",
  });
}

export async function getPurchaseEntry(
  id: number,
): Promise<PurchaseEntryDetails> {
  return api<PurchaseEntryDetails>(`${BASE}/entries/${id}`, {
    method: "GET",
  });
}

export async function updatePurchaseEntryEconomics(
  id: number,
  payload: UpdateImportEconomicsPayload,
) {
  return api(`${BASE}/${id}/economics`, {
    method: "PUT",
    body: payload,
  });
}

export async function previewPurchaseEntryConfirmation(
  id: number,
): Promise<PurchaseEntryConfirmationPreview> {
  return api<PurchaseEntryConfirmationPreview>(`${BASE}/${id}/preview-confirmation`, {
    method: "POST",
  });
}

export async function updatePurchaseEntryItemAllocation(
  id: number,
  itemId: number,
  payload: UpdateImportItemAllocationPayload,
) {
  return api(`${BASE}/${id}/items/${itemId}/allocation`, {
    method: "PUT",
    body: payload,
  });
}
