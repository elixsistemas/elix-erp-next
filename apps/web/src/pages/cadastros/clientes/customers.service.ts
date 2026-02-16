import type { Customer, CustomerCreate, CustomerUpdate } from "./customers.types";

// ajuste conforme onde você salva o token no login
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

  // DELETE 204 não tem body
  if (res.status === 204) return undefined as T;

  if (!ct.includes("application/json")) {
    throw new Error(`Esperava JSON mas veio "${ct}" em ${url}. Início: ${text.slice(0, 80)}`);
  }

  return JSON.parse(text) as T;
}

const base = "/api/customers";

// ✅ backend retorna array
export function listCustomers(): Promise<Customer[]> {
  return api<Customer[]>(base);
}

export function createCustomer(payload: CustomerCreate): Promise<Customer> {
  return api<Customer>(base, { method: "POST", body: JSON.stringify(payload) });
}

// ✅ backend é PATCH /customers/:id
export function updateCustomer(payload: CustomerUpdate & { id: number }): Promise<Customer> {
  const { id, ...rest } = payload;
  return api<Customer>(`${base}/${id}`, { method: "PATCH", body: JSON.stringify(rest) });
}

export async function deleteCustomer(id: number): Promise<{ ok: true }> {
  await api<void>(`${base}/${id}`, { method: "DELETE" });
  return { ok: true };
}
