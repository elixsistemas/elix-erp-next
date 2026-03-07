import * as repo from "./company_modules.repository";

export async function listCatalog(companyId: number) {
  const items = await repo.listCatalogWithCompanyState(companyId);
  return { items };
}

export async function listEnabled(companyId: number) {
  const items = await repo.listEnabledCompanyModules(companyId);
  return { items };
}

export async function update(
  companyId: number,
  modules: Array<{ module_key: string; enabled: boolean }>
) {
  const allowedKeys = new Set(await repo.listCatalogKeys());

  const normalizedMap = new Map<string, boolean>();

  for (const item of modules) {
    const key = String(item.module_key).trim();

    if (!allowedKeys.has(key)) {
      throw new Error(`Invalid module_key: ${key}`);
    }

    normalizedMap.set(key, !!item.enabled);
  }

  const normalized = Array.from(normalizedMap.entries()).map(([module_key, enabled]) => ({
    module_key,
    enabled,
  }));

  await repo.upsertCompanyModules(companyId, normalized);

  const items = await repo.listCatalogWithCompanyState(companyId);

  return {
    ok: true,
    items,
  };
}