import * as repo from "./products.repository";
import type { ProductCreate, ProductUpdate } from "./products.schema";

export function list(companyId: number) {
  return repo.listProducts(companyId);
}

export function get(companyId: number, id: number) {
  return repo.getProduct(companyId, id);
}

export function create(companyId: number, data: ProductCreate) {
  return repo.createProduct(companyId, data);
}

export function update(companyId: number, id: number, data: ProductUpdate) {
  return repo.updateProduct(companyId, id, data);
}

export function deactivate(companyId: number, id: number) {
  return repo.deactivateProduct(companyId, id);
}

export function stock(companyId: number, productId: number) {
  return repo.getProductStock(companyId, productId);
}
