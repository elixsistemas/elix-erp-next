import type { FastifyReply, FastifyRequest } from "fastify";
import { InventoryMovementCreateSchema, InventoryMovementQuerySchema } from "./inventory.schema";
import * as service from "./inventory.service";

export async function create(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const payload = InventoryMovementCreateSchema.parse(req.body);

  const created = await service.create(companyId, payload);
  if (!created) return rep.code(404).send({ message: "Product not found for this company" });

  return rep.code(201).send(created);
}

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const query = InventoryMovementQuerySchema.parse(req.query);

  const data = await service.list(companyId, query);
  return rep.send(data);
}
