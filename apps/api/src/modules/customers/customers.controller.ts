import type { FastifyReply, FastifyRequest } from "fastify";
import { CustomerCreateSchema, CustomerUpdateSchema } from "./customers.schema";
import * as service from "./customers.service";
import { IdParamSchema } from "../../config/params";

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const data = await service.list(companyId);
  return rep.send(data);
}

export async function create(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const payload = CustomerCreateSchema.parse(req.body);
  const created = await service.create(companyId, payload);
  return rep.code(201).send(created);
}

export async function update(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);
  const payload = CustomerUpdateSchema.parse(req.body);

  const updated = await service.update(companyId, id, payload);
  if (!updated) return rep.code(404).send({ message: "Customer not found" });

  return rep.send(updated);
}

export async function remove(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  await service.remove(companyId, id);
  return rep.code(204).send();
}
