import * as repo from "./inventory.repository";

export async function getStock(companyId: number, productId: number) {
  return repo.getStock(companyId, productId);
}

export async function listStock(companyId: number) {
  return repo.listStock(companyId);
}