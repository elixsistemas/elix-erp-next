import type { FastifyReply, FastifyRequest } from "fastify";
import * as service from "./product-kits.service";
import {
  ProductKitListQuerySchema,
  ProductKitUpsertSchema,
} from "./product-kits.schema";

type IdParams = {
  Params: { id: string };
};

export async function list(req: FastifyRequest, reply: FastifyReply) {
  const companyId = req.auth!.companyId;
  const query = ProductKitListQuerySchema.parse(req.query);
  const data = await service.list(companyId, query.q);
  return reply.send(data);
}

export async function get(
  req: FastifyRequest<IdParams>,
  reply: FastifyReply,
) {
  const companyId = req.auth!.companyId;
  const id = Number(req.params.id);

  const data = await service.get(companyId, id);
  if (!data) {
    return reply.code(404).send({ message: "Kit não encontrado" });
  }

  return reply.send(data);
}

export async function upsert(req: FastifyRequest, reply: FastifyReply) {
  const companyId = req.auth!.companyId;
  const body = ProductKitUpsertSchema.parse(req.body);

  const result = await service.upsert(companyId, body);

  if (!result) {
    return reply.code(404).send({ message: "Kit não encontrado" });
  }

  if ("error" in result) {
    switch (result.error) {
      case "KIT_NOT_FOUND":
        return reply.code(404).send({ message: "Kit não encontrado" });
      case "PRODUCT_IS_NOT_KIT":
        return reply.code(400).send({ message: "O item informado não é um kit" });
      case "DUPLICATE_COMPONENTS":
        return reply.code(400).send({ message: "Há componentes repetidos na composição" });
      case "SELF_REFERENCE":
        return reply.code(400).send({ message: "Um kit não pode conter ele mesmo" });
      case "COMPONENT_NOT_FOUND":
        return reply.code(404).send({ message: "Componente não encontrado" });
      case "SERVICE_NOT_ALLOWED":
        return reply.code(400).send({ message: "Serviços não podem compor kits nesta fase" });
    }
  }

  return reply.send(result);
}