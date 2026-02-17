import type { InventoryMovementQuery, InventoryMovementCreate } from "../inventory/inventory.schema";
import * as invRepo from "../inventory/inventory.repository";

export class InventoryMovementsRepository {
  async findByIdempotencyKey(companyId: number, key: string) {
    return invRepo.getMovementByIdempotencyKey(companyId, key);
  }

  async move(input: { companyId: number } & InventoryMovementCreate): Promise<void> {
    return invRepo.createMovement(input.companyId, input);
  }

  async list(params: { companyId: number } & InventoryMovementQuery) {
    return invRepo.listMovements(params.companyId, params);
  }
}
