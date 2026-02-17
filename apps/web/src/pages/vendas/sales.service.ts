// apps/web/src/pages/vendas/sales.service.ts
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

  if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}: ${text.slice(0, 300)}`);
  if (!ct.includes("application/json"))
    throw new Error(`Esperava JSON, veio "${ct}" em ${url}. Início: ${text.slice(0, 120)}`);

  return JSON.parse(text) as T;
}

const base = "/api/sales";

export type SaleRow = {
  id: number;
  customer_id: number;
  quote_id: number | null;
  status: string;
  subtotal: number;
  discount: number;
  total: number;
  notes: string | null;
  created_at: string;
};

export type SaleItemRow = {
  id: number;
  sale_id: number;
  product_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
};

export type SaleDetails = {
  sale: SaleRow;
  items: SaleItemRow[];
};

export function listSales(params?: { from?: string; to?: string; customerId?: number }) {
  const usp = new URLSearchParams();
  if (params?.from) usp.set("from", params.from);
  if (params?.to) usp.set("to", params.to);
  if (params?.customerId) usp.set("customerId", String(params.customerId));
  const qs = usp.toString();
  return api<SaleRow[]>(`${base}${qs ? `?${qs}` : ""}`);
}

export function getSale(id: number) {
  return api<SaleDetails>(`${base}/${id}`);
}

export function listSaleFiscal(id: number) {
  return api<{ documents: any[] }>(`${base}/${id}/fiscal`);
}
