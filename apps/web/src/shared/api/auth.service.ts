// src/shared/api/auth.service.ts
import { api } from "@/shared/api/client";

export async function listCompanies() {
  return api<{ companies: CompanyLite[] }>("/auth/companies", { method: "GET", auth: true });
}

export async function switchCompany(companyId: number) {
  return api<{ token: string }>("/auth/switch", {
    method: "POST",
    auth: true,
    body: { companyId },
  });
}

export type PreloginResponse = {
  loginTicket: string;
  companies: CompanyLite[];
};

export type LoginResponse = {
  token: string;
};

export type CompanyLite = { id: number; name: string };

export async function prelogin(email: string, password: string) {
  return api<{ loginTicket: string; companies: CompanyLite[] }>(`/auth/prelogin`, {
    method: "POST",
    auth: false,
    body: { email, password },
  });
}

export async function finalizeLogin(loginTicket: string, companyId: number) {
  return api<{ token: string }>(`/auth/login`, {
    method: "POST",
    auth: false,
    body: { loginTicket, companyId },
  });
}

export type SessionMe = {
  userId: number;
  companyId: number;
  roles: string[];
  perms: string[];
};

export function getMe() {
  return api<SessionMe>("/auth/me", { method: "GET", auth: true });
}