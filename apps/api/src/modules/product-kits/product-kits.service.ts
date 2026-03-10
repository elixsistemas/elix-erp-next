import * as repo from "./product-kits.repository";
import type { ProductKitUpsert } from "./product-kits.schema";

function hasDuplicateComponents(items: ProductKitUpsert["items"]) {
  const ids = new Set<number>();

  for (const item of items) {
    if (ids.has(item.componentProductId)) return true;
    ids.add(item.componentProductId);
  }

  return false;
}

export async function list(companyId: number, q?: string) {
  return repo.listKits(companyId, q);
}

export async function get(companyId: number, id: number) {
  const kit = await repo.getKit(companyId, id);
  if (!kit) return null;

  const items = await repo.getKitItems(companyId, id);

  return {
    ...kit,
    items,
  };
}

export async function upsert(companyId: number, payload: ProductKitUpsert) {
  const kit = await repo.getProductById(companyId, payload.kitProductId);

  if (!kit) return { error: "KIT_NOT_FOUND" as const };
  if (kit.kind !== "kit") return { error: "PRODUCT_IS_NOT_KIT" as const };

  if (hasDuplicateComponents(payload.items)) {
    return { error: "DUPLICATE_COMPONENTS" as const };
  }

  for (const item of payload.items) {
    if (item.componentProductId === payload.kitProductId) {
      return { error: "SELF_REFERENCE" as const };
    }

    const component = await repo.getProductById(companyId, item.componentProductId);

    if (!component) return { error: "COMPONENT_NOT_FOUND" as const };
    if (component.kind === "service") {
      return { error: "SERVICE_NOT_ALLOWED" as const };
    }
  }

  await repo.deleteKitItems(companyId, payload.kitProductId);
  await repo.insertKitItems(companyId, payload.kitProductId, payload.items);

  return get(companyId, payload.kitProductId);
}