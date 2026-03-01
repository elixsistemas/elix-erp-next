import * as repo from "./products.repository";
import type { ProductCreate, ProductUpdate, ProductListQuery } from "./products.schema";

export function list(args: { companyId: number } & ProductListQuery) {
  return repo.listProducts(args);
}

export function get(companyId: number, id: number) {
  return repo.getProduct(companyId, id);
}

export async function create(companyId: number, data: ProductCreate) {
  // ✅ regra: service não controla estoque
  const payload: ProductCreate = {
    ...data,
    track_inventory: data.kind === "service" ? false : (data.track_inventory ?? true),
  };

  return repo.createProduct(companyId, payload);
}

export async function update(companyId: number, id: number, data: ProductUpdate) {
  const payload: ProductUpdate = {
    ...data,
    track_inventory: data.kind === "service" ? false : data.track_inventory,
  };

  // 🔒 se virar service, remove NCM explicitamente
  if (data.kind === "service") {
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
