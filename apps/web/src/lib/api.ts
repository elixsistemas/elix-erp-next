import { api } from "@/shared/api/client";

export type LookupUser = {
  id: number;
  name: string;
  email: string;
  active: boolean;
  created_at?: string;
};

export type ImportSource = { companyId: number; name: string };

export type UserLookupResult = {
  exists: boolean;
  linked: boolean;
  user: LookupUser | null;
  importSources: ImportSource[];
};

export type UserLinkPayload = {
  email: string;
  name?: string;
  password?: string;
  active?: boolean;
  roleIds?: number[];
  import?: { enabled: boolean; fromCompanyId: number; mode?: "roles" };
};

export const Api = {
  users: {
    list: () => api("/users"),
    create: (data: any) => api("/users", { method: "POST", body: data }),
    update: (id: number, data: any) =>
      api(`/users/${id}`, { method: "PATCH", body: data }),
    getRoles: (id: number) => api(`/users/${id}/roles`),
    setRoles: (id: number, roleIds: number[]) =>
      api(`/users/${id}/roles`, { method: "PUT", body: { roleIds } }),

    // ✅ tipado
    lookup: (email: string) =>
      api<UserLookupResult>(`/users/lookup?email=${encodeURIComponent(email)}`),

    // ✅ tipado (retorno pode ser o user do contexto da empresa)
    link: (data: UserLinkPayload) => api(`/users/link`, { method: "POST", body: data }),
  },

  roles: {
    list: () => api("/roles"),
    create: (data: any) => api("/roles", { method: "POST", body: data }),
    update: (id: number, data: any) =>
      api(`/roles/${id}`, { method: "PATCH", body: data }),
    remove: (id: number) => api(`/roles/${id}`, { method: "DELETE" }),
    permsCatalog: () => api("/permissions"),
    granted: (id: number) => api(`/roles/${id}/permissions`),
    grant: (id: number, permissionCodes: string[]) =>
      api(`/roles/${id}/permissions`, { method: "PUT", body: { permissionCodes } }),
  },
};