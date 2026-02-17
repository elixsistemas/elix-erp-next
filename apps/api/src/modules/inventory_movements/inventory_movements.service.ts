import { InventoryMovementsRepository } from "./inventory_movements.repository";
import type { z } from "zod";
import { createMovementSchema } from "./inventory_movements.schemas";

type CreateMovementInput = z.infer<typeof createMovementSchema>;

function normalize(input: CreateMovementInput) {
  // mantém compat com seu schema atual (ADJUST_POS/NEG)
  if (input.type === "ADJUST_POS") {
    return { ...input, type: "ADJUST_POS" as const, reason: input.reason ?? "ADJUST" };
  }
  if (input.type === "ADJUST_NEG") {
    return { ...input, type: "ADJUST_NEG" as const, reason: input.reason ?? "ADJUST" };
  }
  return { ...input, reason: input.reason ?? "MANUAL" };
}

export class InventoryMovementsService {
  constructor(private repo: InventoryMovementsRepository) {}

  async create(companyId: number, raw: CreateMovementInput) {
    const input = normalize(raw);

    if (input.idempotencyKey) {
      const existing = await this.repo.findByIdempotencyKey(companyId, input.idempotencyKey);
      if (existing) return { ok: true as const, deduped: true as const, movement: existing };
    }

    await this.repo.move({
      companyId,
      productId: input.productId,
      type: input.type,
      quantity: input.quantity,
      source: input.source,
      sourceId: input.sourceId,
      sourceType: input.sourceType ?? input.source,
      reason: input.reason,               // ✅ agora é do normalized
      idempotencyKey: input.idempotencyKey,
      occurredAt: input.occurredAt,
      note: input.note ?? null,
    });

    return { ok: true as const, deduped: false as const };
  }

  async list(companyId: number, params: { productId?: number; limit: number; offset: number; type?: CreateMovementInput["type"]; reason?: any }) {
    return this.repo.list({ companyId, ...params });
  }
}
