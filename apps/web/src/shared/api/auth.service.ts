// src/shared/api/auth.service.ts
import { api } from "@/shared/api/client";

export type CompanyLite = { id: number; name: string };

export type PreloginResponse = {
  loginTicket: string;
  companies: CompanyLite[];
};

export type LoginResponse = {
  token: string;
};

export async function prelogin(email: string, password: string) {
  const data = await api("/auth/prelogin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return data as PreloginResponse;
}

export async function finalizeLogin(loginTicket: string, companyId: number) {
  const data = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ loginTicket, companyId }),
  });

  const token =
    (data as any)?.token ?? (data as any)?.accessToken ?? (data as any)?.data?.token;

  if (!token) throw new Error("Token não retornado pelo servidor");

  return { token } as LoginResponse;
}
