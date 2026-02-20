// apps/web/src/lib/api.ts
type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const token = localStorage.getItem("token"); // ajuste se você guarda em outro lugar

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // tenta ler JSON sempre
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message ?? `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

export const API = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
