// src/shared/api/client.ts
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

export type ApiOptions = Omit<RequestInit, "body" | "headers"> & {
  /** default: true */
  auth?: boolean;
  headers?: HeadersInit;
  body?: unknown;
};


type ApiError = Error & {
  status?: number;
  data?: any;
};

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const auth = options.auth ?? true; // ✅ default ON

  const headers = new Headers(options.headers || {});
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const hasBody = options.body !== undefined && options.body !== null;

  // ✅ só seta content-type se NÃO for formdata e se ainda não foi setado
  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  // ✅ GARANTIR JSON VÁLIDO QUANDO content-type = application/json
  let body = options.body as any;

  if (hasBody && !isFormData) {
    const ct = headers.get("Content-Type") || "";
    const isJson = ct.includes("application/json");

    // Se o caller passar objeto (ex: {name:"x"}), converte pra string JSON.
    // Se já for string, mantém.
    if (isJson && typeof body !== "string") {
      body = JSON.stringify(body);
    }
  }

  const { auth: _auth, body: _rawBody, ...fetchOptions } = options;
  
  const res = await fetch(url, {
    ...fetchOptions,
    headers,
    body,
  });
  // 204 No Content
  if (res.status === 204) return undefined as T;

  const text = await res.text().catch(() => "");
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || `HTTP ${res.status}`;

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
