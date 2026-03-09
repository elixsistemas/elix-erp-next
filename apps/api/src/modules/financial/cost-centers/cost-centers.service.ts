import * as repo from "./cost-centers.repository";

type CostCenterPayload = {
  code?: string;
  name?: string;
  active?: boolean;
  sortOrder?: number;
};

function normalizeCode(value?: string | null) {
  return value?.trim().toUpperCase() || "";
}

function nullableName(value?: string | null) {
  const v = value?.trim();
  return v ? v : "";
}

export async function list(
  companyId: number,
  query: { q?: string; active?: "1" | "0" },
) {
  return repo.listCostCenters({
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
  return repo.getCostCenter(companyId, id);
}

export async function create(companyId: number, data: CostCenterPayload) {
  const code = normalizeCode(data.code);
  const name = nullableName(data.name);

  const exists = await repo.existsCostCenterByCode(companyId, code);
  if (exists) return { error: "CODE_ALREADY_EXISTS" as const };

  const created = await repo.createCostCenter({
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
  data: CostCenterPayload,
) {
  const nextCode =
    "code" in data && data.code !== undefined
      ? normalizeCode(data.code)
      : undefined;

  if (nextCode) {
    const exists = await repo.existsCostCenterByCode(companyId, nextCode, id);
    if (exists) return { error: "CODE_ALREADY_EXISTS" as const };
  }

  const updated = await repo.updateCostCenter({
    companyId,
    id,
    code: nextCode,
    name:
      "name" in data && data.name !== undefined
        ? nullableName(data.name)
        : undefined,
    active: data.active,
    sortOrder: data.sortOrder,
  });

  return { data: updated };
}

export async function remove(companyId: number, id: number) {
  return repo.removeCostCenter(companyId, id);
}