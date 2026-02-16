// apps/api/src/modules/inventory_movements/inventory_movements.controller.ts
import type { FastifyReply, FastifyRequest } from "fastify";
import { createMovementSchema, listMovementsQuerySchema } from "./inventory_movements.schemas";
import type { z } from "zod";
import { InventoryMovementsService } from "./inventory_movements.service";

type CreateBody = z.infer<typeof createMovementSchema>;
type ListQuery = z.infer<typeof listMovementsQuerySchema>;

export class InventoryMovementsController {
  constructor(private service: InventoryMovementsService) {}

  create = async (req: FastifyRequest, rep: FastifyReply) => {
    const companyId = req.auth!.companyId;
    const body = createMovementSchema.parse(req.body);

    try {
      const out = await this.service.create(companyId, body as CreateBody);
      return rep.code(201).send(out);
    } catch (err: any) {
      const msg = String(err?.message ?? "Error");
      if (msg.includes("Insufficient stock")) return rep.code(409).send({ message: "Insufficient stock" });
      if (msg.includes("Product not found")) return rep.code(404).send({ message: "Product not found" });
      return rep.code(400).send({ message: msg });
    }
  };

  list = async (req: FastifyRequest, rep: FastifyReply) => {
    const companyId = req.auth!.companyId;
    const q = listMovementsQuerySchema.parse(req.query ?? {}) as ListQuery;

    const out = await this.service.list(companyId, {
      productId: q.productId,
      type: q.type,
      limit: q.limit ?? 100,
      offset: q.offset ?? 0,
    });

    return rep.send(out);
  };
}
