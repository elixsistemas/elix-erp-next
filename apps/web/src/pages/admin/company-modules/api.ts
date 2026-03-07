import { api } from "@/shared/api/client";

export type CompanyModuleCatalogItem = {
  id?: number;
  module_key: string;
  domain?: string | null;
  label?: string | null;
  description?: string | null;
  sort_order?: number | null;
  active?: boolean;
  enabled: boolean;
};

export type CompanyModulesCatalogResponse = {
  items: CompanyModuleCatalogItem[];
};

export async function getCompanyModulesCatalog() {
  return api<CompanyModulesCatalogResponse>("/admin/company-modules/catalog");
}

export async function updateCompanyModules(modules: Array<{ module_key: string; enabled: boolean }>) {
  return api<CompanyModulesCatalogResponse & { ok: boolean }>("/admin/company-modules", {
    method: "PUT",
    body: { modules },
  });
}