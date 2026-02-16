import type { FastifyReply, FastifyRequest } from "fastify";
import * as service from "./bank_accounts.service";
import { IdParamSchema } from "../../config/params";

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  return rep.send(await service.list(companyId));
}

export async function create(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const body = req.body as any;

  const created = await service.create({
    companyId,
    ...body
  });

  return rep.code(201).send(created);
}

export async function update(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);
  const body = req.body as any;

  const updated = await service.update({
    companyId,
    id,
    ...body
  });

  if (!updated) return rep.code(404).send({ message: "Not found" });

  return rep.send(updated);
}

export async function desativar(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const removed = await service.desativar(companyId, id);
  if (!removed) return rep.code(404).send({ message: "Not found" });

  return rep.send({ ok: true });
}

export async function activate(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const activated = await service.activate(companyId, id);
  if (!activated) return rep.code(404).send({ message: "Not found or already active" });

  return rep.send({ ok: true });
}
