import type {
  InventoryMovementRow,
  InventoryStockResponse,
  InventoryStockRow,
  ProductMini,
  MovementType,
} from "./inventory.types";
import type { MovementFormValues } from "./inventory.schema";

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

const invBase = "/api/inventory";
const movBase = "/api/inventory/movements";
const prodBase = "/api/products";

export function listStock() {
  return api<InventoryStockRow[]>(invBase);
}

export function getStock(productId: number) {
  const usp = new URLSearchParams({ productId: String(productId) });
  return api<InventoryStockResponse>(`${invBase}/stock?${usp.toString()}`);
}

export function listMovements(params: {
  productId?: number;
  type?: MovementType;
  limit?: number;
  offset?: number;
}) {
  const usp = new URLSearchParams();

  if (params.productId) usp.set("productId", String(params.productId));
  if (params.type) usp.set("type", params.type);

  usp.set("limit", String(params.limit ?? 100));
  usp.set("offset", String(params.offset ?? 0));

  return api<InventoryMovementRow[]>(`${movBase}?${usp.toString()}`);
}

export function createMovement(payload: MovementFormValues) {
  const isAdjust = payload.type === "ADJUST_POS" || payload.type === "ADJUST_NEG";
  const reason = isAdjust ? "ADJUST" : "MANUAL";
  const ts = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const idempotencyKey = `UI:${payload.type}:${payload.productId}:${ts}`;

  const finalPayload = {
    ...payload,
    source: payload.source?.trim() || "MANUAL",
    sourceType: "MANUAL",
    reason,
    idempotencyKey,
    occurredAt: new Date().toISOString(),
  };

  return api<{ ok: true; deduped?: boolean; movement?: unknown }>(movBase, {
    method: "POST",
    body: JSON.stringify(finalPayload),
  });
}

export async function listProductsMini(): Promise<ProductMini[]> {
  const data = await api<any>(prodBase);
  const arr = Array.isArray(data) ? data : (data?.data ?? []);

  if (!Array.isArray(arr)) return [];

  return arr.map((p: any) => ({
    id: Number(p.id),
    name: String(p.name ?? ""),
    sku: p.sku ?? null,
  }));
}