// apps/api/src/modules/inventory_movements/inventory_movements.service.ts
import { InventoryMovementsRepository } from "./inventory_movements.repository";
import type { z } from "zod";
import { createMovementSchema } from "./inventory_movements.schemas";

type CreateMovementInput = z.infer<typeof createMovementSchema>;

export class InventoryMovementsService {
  constructor(private repo: InventoryMovementsRepository) {}

  async create(companyId: number, input: CreateMovementInput) {
    await this.repo.move({
      companyId,
      productId: input.productId,
      type: input.type,
      quantity: input.quantity,
      source: input.source,
      sourceId: input.sourceId,
      note: input.note ?? null, // garante compat com repo/schema
    });

    return { ok: true as const };
  }

  async list(companyId: number, params: { productId?: number; limit: number; offset: number; type?: CreateMovementInput["type"] }) {
    return this.repo.list({ companyId, ...params });
  }
}
