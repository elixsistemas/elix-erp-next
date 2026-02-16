import type { Company, CompanyCreate, CompanyUpdate } from "./companies.types";

// ajuste aqui conforme onde você guarda o token
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
    // devolve erro legível (e não “Unexpected token”)
    throw new Error(`HTTP ${res.status} em ${url}: ${text.slice(0, 300)}`);
  }

  if (!ct.includes("application/json")) {
    throw new Error(`Esperava JSON mas veio "${ct}" em ${url}. Início: ${text.slice(0, 80)}`);
  }

  return JSON.parse(text) as T;
}

// IMPORTANTE: prefixo /api para passar pelo proxy do Vite
const base = "/api/companies";

// 🔎 Seu backend tem GET /companies (pode ser array ou objeto)
// Vamos normalizar para sempre retornar Company[]
export async function listCompanies(): Promise<Company[]> {
  const data = await api<unknown>(base);
  console.log("companies /api/companies raw:", data);

  if (Array.isArray(data)) return data as Company[];
  if (data && typeof data === "object") return [data as Company];
  return [];
}


// ✅ Seu backend tem PATCH /companies/me (atualiza a empresa do escopo)
export async function updateCompany(payload: CompanyUpdate): Promise<Company> {
  return api<Company>(`${base}/me`, {
    method: "PATCH",
    body: JSON.stringify({ name: payload.name, cnpj: payload.cnpj ?? null }),
  });
}

/**
 * ⚠️ createCompany / deleteCompany só vão funcionar se você EXPOR essas rotas no backend.
 * Se você quer “cadastro de empresas” de verdade, roteie POST/DELETE.
 */
export async function createCompany(payload: CompanyCreate): Promise<Company> {
  // se você adicionar app.post("/companies"...)
  return api<Company>(base, { method: "POST", body: JSON.stringify(payload) });
}

export async function deleteCompany(id: number): Promise<{ ok: true }> {
  // se você adicionar app.delete("/companies/:id"...)
  await api<void>(`${base}/${id}`, { method: "DELETE" });
  return { ok: true };
}
