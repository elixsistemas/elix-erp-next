// src/shared/api/client.ts
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

export type ApiOptions = RequestInit & {
  /** default: true */
  auth?: boolean;
};

type ApiError = Error & {
  status?: number;
  data?: any;
};

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const auth = options.auth ?? true; // ✅ default ON

  const headers = new Headers(options.headers || {});
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  // ✅ só seta content-type se NÃO for formdata e se ainda não foi setado
  const hasBody = options.body !== undefined && options.body !== null;

  // só seta content-type quando houver body (e não for FormData)
  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const text = await res.text().catch(() => "");
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `HTTP ${res.status}`;

    const err: ApiError = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data as T;
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}
