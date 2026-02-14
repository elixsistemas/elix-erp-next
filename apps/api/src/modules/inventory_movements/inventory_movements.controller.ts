import { FastifyReply, FastifyRequest } from "fastify";
import { createMovementSchema, listMovementsQuerySchema } from "./inventory_movements.schemas";
import { InventoryMovementsService } from "./inventory_movements.service";

export class InventoryMovementsController {
  constructor(private service: InventoryMovementsService) {}

  create = async (req: FastifyRequest, rep: FastifyReply) => {
    const companyId = (req as any).auth.companyId;
    const body = createMovementSchema.parse((req as any).body);

    try {
      const out = await this.service.create(companyId, body);
      return rep.code(201).send(out);
    } catch (err: any) {
      const msg = String(err?.message ?? "Error");
      if (msg.includes("Insufficient stock")) return rep.code(409).send({ message: "Insufficient stock" });
      if (msg.includes("FK_inventory_movements_products")) return rep.code(404).send({ message: "Product not found" });
      return rep.code(400).send({ message: msg });
    }
  };

  list = async (req: FastifyRequest, rep: FastifyReply) => {
    const companyId = (req as any).auth.companyId;
    const q = listMovementsQuerySchema.parse((req as any).query ?? {});
    const limit = q.limit ?? 100;
    const offset = q.offset ?? 0;

    const out = await this.service.list(companyId, { productId: q.productId, limit, offset });
    return rep.send(out);
  };
}
