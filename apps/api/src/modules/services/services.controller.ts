import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

import * as service from "./services.service";
import {
  IdParamSchema,
  ServiceCreateSchema,
  ServiceListQuerySchema,
  ServiceUpdateSchema,
} from "./services.schema";

type IdParams = {
  Params: { id: string };
};

function sendZod(reply: FastifyReply, err: ZodError) {
  return reply.code(400).send({
    message: "Validation error",
    issues: err.issues,
  });
}

export async function list(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = req.auth!.companyId;
    const query = ServiceListQuerySchema.parse(req.query);

    const data = await service.list({
      companyId,
      ...query,
    });

    return reply.send(data);
  } catch (err) {
    if (err instanceof ZodError) return sendZod(reply, err);
    throw err;
  }
}

export async function get(
  req: FastifyRequest<IdParams>,
  reply: FastifyReply,
) {
  try {
    const companyId = req.auth!.companyId;
    const { id } = IdParamSchema.parse(req.params);

    const data = await service.get(companyId, id);

    if (!data) {
      return reply.code(404).send({ message: "Serviço não encontrado" });
    }

    return reply.send(data);
  } catch (err) {
    if (err instanceof ZodError) return sendZod(reply, err);
    throw err;
  }
}

export async function create(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = req.auth!.companyId;
    const body = ServiceCreateSchema.parse(req.body);

    const data = await service.create(companyId, body);
    return reply.code(201).send(data);
  } catch (err) {
    if (err instanceof ZodError) return sendZod(reply, err);
    throw err;
  }
}

export async function update(
  req: FastifyRequest<IdParams>,
  reply: FastifyReply,
) {
  try {
    const companyId = req.auth!.companyId;
    const { id } = IdParamSchema.parse(req.params);
    const body = ServiceUpdateSchema.parse(req.body);

    const data = await service.update(companyId, id, body);

    if (!data) {
      return reply.code(404).send({ message: "Serviço não encontrado" });
    }

    return reply.send(data);
  } catch (err) {
    if (err instanceof ZodError) return sendZod(reply, err);
    throw err;
  }
}

export async function remove(
  req: FastifyRequest<IdParams>,
  reply: FastifyReply,
) {
  try {
    const companyId = req.auth!.companyId;
    const { id } = IdParamSchema.parse(req.params);

    const data = await service.remove(companyId, id);

    if (!data) {
      return reply.code(404).send({ message: "Serviço não encontrado" });
    }

    return reply.send(data);
  } catch (err) {
    if (err instanceof ZodError) return sendZod(reply, err);
    throw err;
  }
}