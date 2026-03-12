import type {
  FinancialOptions,
  ProductMini,
  PurchaseEntryImportDetails,
  PurchaseEntryImportRow,
  PurchaseEntryImportStatus,
  SupplierMini,
} from "./purchase-entry-imports.types";
import type { PurchaseEntryImportUploadValues } from "./purchase-entry-imports.schema";

function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("access_token") || "";
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((init?.headers as Record<string, string> | undefined) ?? {}),
  };

  if (init?.body !== undefined && init?.body !== null) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...init,
    headers,
  });

  const text = await res.text();
  const ct = res.headers.get("content-type") ?? "";

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} em ${url}: ${text.slice(0, 300)}`);
  }

  if (!ct.includes("application/json")) {
    throw new Error(`Esperava JSON, veio "${ct}" em ${url}. Início: ${text.slice(0, 120)}`);
  }

  return JSON.parse(text) as T;
}

const base = "/api/purchase-entry-imports";

export function listPurchaseEntryImports(params?: {
  status?: PurchaseEntryImportStatus;
  q?: string;
  supplierId?: number;
  limit?: number;
  offset?: number;
}) {
  const usp = new URLSearchParams();

  if (params?.status) usp.set("status", params.status);
  if (params?.q?.trim()) usp.set("q", params.q.trim());
  if (params?.supplierId) usp.set("supplierId", String(params.supplierId));
  usp.set("limit", String(params?.limit ?? 100));
  usp.set("offset", String(params?.offset ?? 0));

  return api<PurchaseEntryImportRow[]>(`${base}?${usp.toString()}`);
}

export function getPurchaseEntryImportById(id: number) {
  return api<PurchaseEntryImportDetails>(`${base}/${id}`);
}

export function getPurchaseEntryFinancialOptions() {
  return api<FinancialOptions>(`${base}/financial-options`);
}

export function importPurchaseEntryXml(payload: PurchaseEntryImportUploadValues) {
  return api<PurchaseEntryImportDetails>(`${base}/import-xml`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePurchaseEntryFinancial(
  id: number,
  payload: {
    chartAccountId?: number | null;
    costCenterId?: number | null;
    paymentTermId?: number | null;
  },
) {
  return api<PurchaseEntryImportDetails>(`${base}/${id}/financial`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function matchPurchaseEntrySupplier(id: number, supplierId: number) {
  return api<PurchaseEntryImportDetails>(`${base}/${id}/match-supplier`, {
    method: "PUT",
    body: JSON.stringify({ supplierId }),
  });
}

export function createSupplierFromImport(id: number, payload?: { overwriteName?: string }) {
  return api<PurchaseEntryImportDetails>(`${base}/${id}/create-supplier`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export function matchPurchaseEntryProduct(id: number, itemId: number, productId: number) {
  return api<PurchaseEntryImportDetails>(`${base}/${id}/items/${itemId}/match-product`, {
    method: "PUT",
    body: JSON.stringify({ productId }),
  });
}

export function createProductFromImportItem(
  id: number,
  itemId: number,
  payload?: {
    overwriteName?: string;
    kind?: "product" | "service";
    trackInventory?: boolean;
  },
) {
  return api<PurchaseEntryImportDetails>(`${base}/${id}/items/${itemId}/create-product`, {
    method: "POST",
    body: JSON.stringify(payload ?? { kind: "product", trackInventory: true }),
  });
}

export function updatePurchaseEntryItem(
  id: number,
  itemId: number,
  payload: {
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
  },
) {
  return api<PurchaseEntryImportDetails>(`${base}/${id}/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updatePurchaseEntryInstallment(
  id: number,
  installmentId: number,
  payload: {
    dueDate?: string;
    amount?: number;
  },
) {
  return api<PurchaseEntryImportDetails>(`${base}/${id}/installments/${installmentId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function confirmPurchaseEntryImport(id: number) {
  return api<{ accountsPayableId: number | null }>(`${base}/${id}/confirm`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function cancelPurchaseEntryImport(id: number) {
  return api<{ ok: true }>(`${base}/${id}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });
}

export async function listSuppliersMini(): Promise<SupplierMini[]> {
  const data = await api<any>("/api/suppliers");
  const arr = Array.isArray(data) ? data : (data?.data ?? []);
  return Array.isArray(arr)
    ? arr.map((x: any) => ({ id: Number(x.id), name: String(x.name ?? "") }))
    : [];
}

export async function listProductsMini(): Promise<ProductMini[]> {
  const data = await api<any>("/api/products");
  const arr = Array.isArray(data) ? data : (data?.data ?? []);
  return Array.isArray(arr)
    ? arr.map((x: any) => ({
        id: Number(x.id),
        name: String(x.name ?? ""),
        sku: x.sku ?? null,
      }))
    : [];
}