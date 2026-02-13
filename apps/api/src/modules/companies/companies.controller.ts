import type { FastifyReply, FastifyRequest } from "fastify";
import { CompanyCreateSchema, CompanyUpdateSchema } from "./companies.schema";
import * as service from "./companies.service";
import { IdParamSchema } from "../../config/params";

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const data = await service.list();
  return rep.send(data);
}

export async function get(req: FastifyRequest<{ Params: { id: string } }>, rep: FastifyReply) {
  const { id } = IdParamSchema.parse(req.params);
  const company = await service.get(id);
  if (!company) return rep.code(404).send({ message: "Company not found" });
  return rep.send(company);
}

export async function create(req: FastifyRequest, rep: FastifyReply) {
  const payload = CompanyCreateSchema.parse(req.body);
  const created = await service.create(payload);
  return rep.code(201).send(created);
}

export async function update(
  req: FastifyRequest<{ Params: { id: string } }>,
  rep: FastifyReply
) {
  const { id } = IdParamSchema.parse(req.params);
  const payload = CompanyUpdateSchema.parse(req.body);
  const updated = await service.update(id, payload);
  if (!updated) return rep.code(404).send({ message: "Company not found" });
  return rep.send(updated);
}

export async function remove(
  req: FastifyRequest<{ Params: { id: string } }>,
  rep: FastifyReply
) {
  const { id } = IdParamSchema.parse(req.params);
  const ok = await service.remove(id);
  if (!ok) return rep.code(404).send({ message: "Company not found" });
  return rep.code(204).send();
}
