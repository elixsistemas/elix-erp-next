import type { FastifyReply, FastifyRequest } from "fastify";
import * as service from "./product-categories.service";
import {
  ProductCategoryCreateSchema,
  ProductCategoryListQuerySchema,
  ProductCategoryUpdateSchema,
} from "./product-categories.schema";

type IdParams = {
  Params: { id: string };
};

export async function list(req: FastifyRequest, reply: FastifyReply) {
  const companyId = req.auth!.companyId;
  const query = ProductCategoryListQuerySchema.parse(req.query);
  const data = await service.list(companyId, query);
  return reply.send(data);
}

export async function tree(req: FastifyRequest, reply: FastifyReply) {
  const companyId = req.auth!.companyId;
  const data = await service.tree(companyId);
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
    return reply.code(404).send({ message: "Categoria não encontrada" });
  }

  return reply.send(data);
}

export async function create(req: FastifyRequest, reply: FastifyReply) {
  const companyId = req.auth!.companyId;
  const body = ProductCategoryCreateSchema.parse(req.body);

  const result = await service.create(companyId, body);

  if ("error" in result) {
    if (result.error === "CODE_ALREADY_EXISTS") {
      return reply.code(409).send({ message: "Já existe uma categoria com este código" });
    }

    if (result.error === "INVALID_PARENT") {
      return reply.code(400).send({ message: "Categoria pai inválida" });
    }
  }

  return reply.code(201).send(result.data);
}

export async function update(
  req: FastifyRequest<IdParams>,
  reply: FastifyReply,
) {
  const companyId = req.auth!.companyId;
  const id = Number(req.params.id);
  const body = ProductCategoryUpdateSchema.parse(req.body);

  const result = await service.update(companyId, id, body);

  if ("error" in result) {
    if (result.error === "CODE_ALREADY_EXISTS") {
      return reply.code(409).send({ message: "Já existe uma categoria com este código" });
    }

    if (result.error === "INVALID_PARENT") {
      return reply.code(400).send({ message: "Categoria pai inválida" });
    }

    if (result.error === "SELF_PARENT") {
      return reply.code(400).send({ message: "Uma categoria não pode ser pai dela mesma" });
    }

    if (result.error === "CIRCULAR_REFERENCE") {
      return reply.code(400).send({ message: "Movimento inválido: referência circular na hierarquia" });
    }
  }

  if (!result.data) {
    return reply.code(404).send({ message: "Categoria não encontrada" });
  }

  return reply.send(result.data);
}

export async function remove(
  req: FastifyRequest<IdParams>,
  reply: FastifyReply,
) {
  const companyId = req.auth!.companyId;
  const id = Number(req.params.id);

  const result = await service.remove(companyId, id);

  if ("error" in result && result.error === "HAS_CHILDREN") {
    return reply.code(400).send({ message: "Não é permitido excluir categoria com subcategorias" });
  }

  if (!result.data) {
    return reply.code(404).send({ message: "Categoria não encontrada" });
  }

  return reply.code(204).send();
}