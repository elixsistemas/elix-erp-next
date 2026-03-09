import type { FastifyReply, FastifyRequest } from "fastify";
import * as service from "./cost-centers.service";
import {
  CostCenterCreateSchema,
  CostCenterListQuerySchema,
  CostCenterUpdateSchema,
} from "./cost-centers.schema";

export async function list(req: FastifyRequest, reply: FastifyReply) {
  const companyId = req.auth!.companyId;
  const query = CostCenterListQuerySchema.parse(req.query);
  const data = await service.list(companyId, query);
  return reply.send(data);
}

export async function get(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const companyId = req.auth!.companyId;
  const id = Number(req.params.id);

  const data = await service.get(companyId, id);
  if (!data) {
    return reply.code(404).send({ message: "Centro de custo não encontrado" });
  }

  return reply.send(data);
}

export async function create(req: FastifyRequest, reply: FastifyReply) {
  const companyId = req.auth!.companyId;
  const body = CostCenterCreateSchema.parse(req.body);

  const result = await service.create(companyId, body);

  if ("error" in result && result.error === "CODE_ALREADY_EXISTS") {
    return reply
      .code(409)
      .send({ message: "Já existe um centro de custo com este código" });
  }

  return reply.code(201).send(result.data);
}

export async function update(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const companyId = req.auth!.companyId;
  const id = Number(req.params.id);
  const body = CostCenterUpdateSchema.parse(req.body);

  const result = await service.update(companyId, id, body);

  if ("error" in result && result.error === "CODE_ALREADY_EXISTS") {
    return reply
      .code(409)
      .send({ message: "Já existe um centro de custo com este código" });
  }

  if (!result.data) {
    return reply.code(404).send({ message: "Centro de custo não encontrado" });
  }

  return reply.send(result.data);
}

export async function remove(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const companyId = req.auth!.companyId;
  const id = Number(req.params.id);

  const ok = await service.remove(companyId, id);
  if (!ok) {
    return reply.code(404).send({ message: "Centro de custo não encontrado" });
  }

  return reply.code(204).send();
}