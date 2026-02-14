import * as repo from "./inventory.repository";
import type { InventoryMovementCreate, InventoryMovementQuery } from "./inventory.schema";

export async function create(companyId: number, data: InventoryMovementCreate) {
  const ok = await repo.ensureProductBelongsToCompany(companyId, data.productId);
  if (!ok) return null; // produto não pertence à empresa (ou não existe)
  return repo.createMovement(companyId, data);
}

export function list(companyId: number, query: InventoryMovementQuery) {
  return repo.listMovements(companyId, query);
}
