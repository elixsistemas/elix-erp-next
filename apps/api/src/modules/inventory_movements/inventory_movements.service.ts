import { InventoryMovementsRepository } from "./inventory_movements.repository";

export class InventoryMovementsService {
  constructor(private repo: InventoryMovementsRepository) {}

  async create(companyId: number, data: any) {
    await this.repo.move({ companyId, ...data });
    return { ok: true };
  }

  async list(companyId: number, opts: { productId?: number; limit: number; offset: number }) {
    const items = await this.repo.list({ companyId, ...opts });
    return { items };
  }
}
