// apps/api/src/modules/company_modules/company_modules.service.ts
import type { CompanyModuleItem } from "./company_modules.schema";
import * as repo from "./company_modules.repository";

export async function list(companyId: number) {
  const items = await repo.listCompanyModules(companyId);
  return { items };
}

export async function update(companyId: number, modules: CompanyModuleItem[]) {
  await repo.upsertCompanyModules(companyId, modules);

  // ✅ retorna estado final (evita “frontend acha que atualizou”)
  const items = await repo.listCompanyModules(companyId);
  return { ok: true, items };
}