import { api } from "@/shared/api/client"; // se você ainda usa o client antigo
// ou use o request direto se preferir

export const Api = {
  users: {
    list: () => api("/users"),
    create: (data: any) => api("/users", { method: "POST", body: data }),
    update: (id: number, data: any) =>
      api(`/users/${id}`, { method: "PATCH", body: data }),
    getRoles: (id: number) => api(`/users/${id}/roles`),
    setRoles: (id: number, roleIds: number[]) =>
      api(`/users/${id}/roles`, { method: "PUT", body: { roleIds } }),
  },

  roles: {
    list: () => api("/roles"),
    create: (data: any) => api("/roles", { method: "POST", body: data }),
    update: (id: number, data: any) =>
      api(`/roles/${id}`, { method: "PATCH", body: data }),
    remove: (id: number) =>
      api(`/roles/${id}`, { method: "DELETE" }),
    permsCatalog: () => api("/permissions"),
    granted: (id: number) =>
      api(`/roles/${id}/permissions`),
    grant: (id: number, permissionCodes: string[]) =>
      api(`/roles/${id}/permissions`, {
        method: "PUT",
        body: { permissionCodes },
      }),
  },
};