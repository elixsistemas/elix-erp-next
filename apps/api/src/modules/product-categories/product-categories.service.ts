import * as repo from "./product-categories.repository";

type ProductCategoryPayload = {
  parentId?: number | null;
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

function buildTree(rows: any[]) {
  const map = new Map<number, any>();
  const roots: any[] = [];

  for (const row of rows) {
    map.set(row.id, { ...row, children: [] });
  }

  for (const row of rows) {
    const node = map.get(row.id)!;
    if (row.parent_id && map.has(row.parent_id)) {
      map.get(row.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function list(
  companyId: number,
  query: { q?: string; active?: "1" | "0"; parentId?: number },
) {
  return repo.listProductCategories({
    companyId,
    q: query.q,
    parentId: query.parentId,
    active:
      query.active === "1"
        ? true
        : query.active === "0"
          ? false
          : undefined,
  });
}

export async function tree(companyId: number) {
  const rows = await repo.listProductCategoriesTree(companyId);
  return buildTree(rows);
}

export async function get(companyId: number, id: number) {
  return repo.getProductCategory(companyId, id);
}

export async function create(companyId: number, data: ProductCategoryPayload) {
  const code = normalizeCode(data.code);
  const name = normalizeName(data.name);

  if (data.parentId) {
    const parent = await repo.getProductCategory(companyId, data.parentId);
    if (!parent) return { error: "INVALID_PARENT" as const };
  }

  const exists = await repo.existsProductCategoryByCode(companyId, code);
  if (exists) return { error: "CODE_ALREADY_EXISTS" as const };

  const created = await repo.createProductCategory({
    companyId,
    parentId: data.parentId ?? null,
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
  data: ProductCategoryPayload,
) {
  if (data.parentId !== undefined && data.parentId !== null) {
    if (data.parentId === id) {
      return { error: "SELF_PARENT" as const };
    }

    const parent = await repo.getProductCategory(companyId, data.parentId);
    if (!parent) return { error: "INVALID_PARENT" as const };

    const circular = await repo.isDescendantOf(companyId, id, data.parentId);
    if (circular) return { error: "CIRCULAR_REFERENCE" as const };
  }

  const nextCode =
    "code" in data && data.code !== undefined
      ? normalizeCode(data.code)
      : undefined;

  if (nextCode) {
    const exists = await repo.existsProductCategoryByCode(companyId, nextCode, id);
    if (exists) return { error: "CODE_ALREADY_EXISTS" as const };
  }

  const updated = await repo.updateProductCategory({
    companyId,
    id,
    parentId:
      data.parentId === undefined ? undefined : (data.parentId ?? null),
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
  const children = await repo.countChildren(companyId, id);
  if (children > 0) return { error: "HAS_CHILDREN" as const };

  const ok = await repo.removeProductCategory(companyId, id);
  return { data: ok };
}