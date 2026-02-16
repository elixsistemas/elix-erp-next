import type { Product, ProductCreate, ProductUpdate } from "./products.types";

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
  if (text && !ct.includes("application/json")) {
    throw new Error(`Esperava JSON mas veio "${ct}" em ${url}. Início: ${text.slice(0, 80)}`);
  }

  return (text ? JSON.parse(text) : null) as T;
}

const base = "/api/products";

export async function listProducts(): Promise<Product[]> {
  const data = await api<unknown>(base);
  if (Array.isArray(data)) return data as Product[];
  if (data && typeof data === "object") return [data as Product];
  return [];
}

export function createProduct(payload: ProductCreate) {
  return api<Product>(base, { method: "POST", body: JSON.stringify(payload) });
}

export function updateProduct(payload: ProductUpdate) {
  const { id, ...rest } = payload;
  return api<Product>(`${base}/${id}`, { method: "PATCH", body: JSON.stringify(rest) });
}

export async function deleteProduct(id: number) {
  await api<void>(`${base}/${id}`, { method: "DELETE" });
  return { ok: true as const };
}
