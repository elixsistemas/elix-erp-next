import type { FastifyReply, FastifyRequest } from "fastify";
import * as service from "./inventory.service";
import { InventoryStockQuerySchema } from "./inventory.schema";

function getAuthOrThrow(req: FastifyRequest) {
  if (!req.auth) {
    throw new Error("Unauthorized");
  }

  return req.auth;
}

export async function listStock(req: FastifyRequest, rep: FastifyReply) {
  const auth = getAuthOrThrow(req);
  const data = await service.listStock(auth.companyId);
  return rep.send(data);
}

export async function stock(req: FastifyRequest, rep: FastifyReply) {
  const auth = getAuthOrThrow(req);
  const query = InventoryStockQuerySchema.parse(req.query);

  const onHand = await service.getStock(auth.companyId, query.productId);

  return rep.send({
    productId: query.productId,
    onHand,
  });
}