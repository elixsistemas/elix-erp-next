import * as repo from "./products.repository";
import type { ProductCreate, ProductUpdate, ProductListQuery } from "./products.schema";

function resolveTrackInventory(
  kind: "product" | "service" | "consumable" | "kit",
  explicit?: boolean | null,
) {
  if (kind === "service") return false;
  if (kind === "kit") return false;
  if (kind === "consumable") return explicit ?? false;
  return explicit ?? true;
}

export function list(args: { companyId: number } & ProductListQuery) {
  return repo.listProducts(args);
}

export function get(companyId: number, id: number) {
  return repo.getProduct(companyId, id);
}

export async function create(companyId: number, data: ProductCreate) {
  const payload: ProductCreate = {
    ...data,
    track_inventory: resolveTrackInventory(data.kind, data.track_inventory ?? null),
  };

  if (data.kind === "service" || data.kind === "kit") {
    (payload as any).ncmId = null;
    (payload as any).ncm = null;
  }

  return repo.createProduct(companyId, payload);
}

export async function update(companyId: number, id: number, data: ProductUpdate) {
  const payload: ProductUpdate = {
    ...data,
    track_inventory: data.kind
      ? resolveTrackInventory(data.kind, data.track_inventory ?? null)
      : data.track_inventory,
  };

  if (data.kind === "service" || data.kind === "kit") {
    (payload as any).ncmId = null;
    (payload as any).ncm = null;
  }

  return repo.updateProduct(companyId, id, payload);
}

export function deactivate(companyId: number, id: number) {
  return repo.deactivateProduct(companyId, id);
}

export function stock(companyId: number, productId: number) {
  return repo.getProductStock(companyId, productId);
}