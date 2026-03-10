import * as repo from "./brands.repository";

type BrandPayload = {
  code?: string;
  name?: string;
  active?: boolean;
  sortOrder?: number;
};

function normalizeCode(value?: string | null) {
  return value?.trim().toUpperCase() || "";
}

function normalizeName(value?: string | null) {
  const v = value?.trim();
  return v ? v : "";
}

export async function list(
  companyId: number,
  query: { q?: string; active?: "1" | "0" },
) {
  return repo.listBrands({
    companyId,
    q: query.q,
    active:
      query.active === "1"
        ? true
        : query.active === "0"
          ? false
          : undefined,
  });
}

export async function get(companyId: number, id: number) {
  return repo.getBrand(companyId, id);
}

export async function create(companyId: number, data: BrandPayload) {
  const code = normalizeCode(data.code);
  const name = normalizeName(data.name);

  const exists = await repo.existsBrandByCode(companyId, code);
  if (exists) return { error: "CODE_ALREADY_EXISTS" as const };

  const created = await repo.createBrand({
    companyId,
    code,
    name,
    active: data.active ?? true,
    sortOrder: data.sortOrder ?? 0,
  });

  return { data: created };
}

export async function update(
  companyId: number,
  id: number,
  data: BrandPayload,
) {
  const nextCode =
    "code" in data && data.code !== undefined
      ? normalizeCode(data.code)
      : undefined;

  if (nextCode) {
    const exists = await repo.existsBrandByCode(companyId, nextCode, id);
    if (exists) return { error: "CODE_ALREADY_EXISTS" as const };
  }

  const updated = await repo.updateBrand({
    companyId,
    id,
    code: nextCode,
    name:
      "name" in data && data.name !== undefined
        ? normalizeName(data.name)
        : undefined,
    active: data.active,
    sortOrder: data.sortOrder,
  });

  return { data: updated };
}

export async function remove(companyId: number, id: number) {
  return repo.removeBrand(companyId, id);
}