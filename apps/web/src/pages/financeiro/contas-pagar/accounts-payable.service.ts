import type {
  AccountsPayableRow,
  SupplierMini,
  PaymentConditionMini,
  PaymentMethodMini,
  BankAccountMini,
  ChartAccountMini,
  CostCenterMini,
  AccountsPayableStatus,
} from "./accounts-payable.types";
import type { AccountsPayableFormValues } from "./accounts-payable.schema";

function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("access_token") || "";
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const token = getToken();

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
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

const base = "/api/accounts-payable";

export function listAccountsPayable(params?: {
  supplierId?: number;
  status?: AccountsPayableStatus;
  q?: string;
  issueDateFrom?: string;
  issueDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  overdueOnly?: boolean;
  limit?: number;
  offset?: number;
}) {
  const usp = new URLSearchParams();

  if (params?.supplierId) usp.set("supplierId", String(params.supplierId));
  if (params?.status) usp.set("status", params.status);
  if (params?.q?.trim()) usp.set("q", params.q.trim());
  if (params?.issueDateFrom) usp.set("issueDateFrom", params.issueDateFrom);
  if (params?.issueDateTo) usp.set("issueDateTo", params.issueDateTo);
  if (params?.dueDateFrom) usp.set("dueDateFrom", params.dueDateFrom);
  if (params?.dueDateTo) usp.set("dueDateTo", params.dueDateTo);
  if (params?.overdueOnly) usp.set("overdueOnly", "1");
  usp.set("limit", String(params?.limit ?? 100));
  usp.set("offset", String(params?.offset ?? 0));

  return api<AccountsPayableRow[]>(`${base}?${usp.toString()}`);
}

export function getAccountsPayableById(id: number) {
  return api<AccountsPayableRow>(`${base}/${id}`);
}

export function createAccountsPayable(payload: AccountsPayableFormValues) {
  return api<{ id: number }>(base, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAccountsPayable(id: number, payload: AccountsPayableFormValues) {
  return api<{ ok: true }>(`${base}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateAccountsPayableStatus(id: number, status: AccountsPayableStatus) {
  return api<{ ok: true }>(`${base}/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function listSuppliersMini(): Promise<SupplierMini[]> {
  const data = await api<any>("/api/suppliers");
  const arr = Array.isArray(data) ? data : (data?.data ?? []);
  return Array.isArray(arr)
    ? arr.map((x: any) => ({ id: Number(x.id), name: String(x.name ?? "") }))
    : [];
}

export async function listPaymentTermsMini(): Promise<PaymentConditionMini[]> {
  const data = await api<any>("/api/payment-conditions");
  const arr = Array.isArray(data) ? data : (data?.data ?? []);
  return Array.isArray(arr)
    ? arr.map((x: any) => ({ id: Number(x.id), name: String(x.name ?? "") }))
    : [];
}

export async function listPaymentMethodsMini(): Promise<PaymentMethodMini[]> {
  const data = await api<any>("/api/payment-methods");
  const arr = Array.isArray(data) ? data : (data?.data ?? []);
  return Array.isArray(arr)
    ? arr.map((x: any) => ({ id: Number(x.id), name: String(x.name ?? "") }))
    : [];
}

export async function listBankAccountsMini(): Promise<BankAccountMini[]> {
  const data = await api<any>("/api/bank-accounts");
  const arr = Array.isArray(data) ? data : (data?.data ?? []);
  return Array.isArray(arr)
    ? arr.map((x: any) => ({ id: Number(x.id), name: String(x.name ?? "") }))
    : [];
}

export async function listChartAccountsMini(): Promise<ChartAccountMini[]> {
  const data = await api<any>("/api/chart-of-accounts");
  const arr = Array.isArray(data) ? data : (data?.data ?? []);
  return Array.isArray(arr)
    ? arr.map((x: any) => ({ id: Number(x.id), name: String(x.name ?? "") }))
    : [];
}

export async function listCostCentersMini(): Promise<CostCenterMini[]> {
  const data = await api<any>("/api/cost-centers");
  const arr = Array.isArray(data) ? data : (data?.data ?? []);
  return Array.isArray(arr)
    ? arr.map((x: any) => ({ id: Number(x.id), name: String(x.name ?? "") }))
    : [];
}