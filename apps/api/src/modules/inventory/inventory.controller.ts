import type { FastifyReply, FastifyRequest } from "fastify";
import * as service from "./inventory.service";

export async function listStock(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const data = await service.listStock(companyId);
  return rep.send(data);
}

export async function stock(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const productId = Number((req.query as any)?.productId);

  if (!Number.isFinite(productId) || productId <= 0) {
    return rep.code(400).send({ message: "productId is required" });
  }

  const onHand = await service.getStock(companyId, productId);
  return rep.send({ productId, onHand });
}
