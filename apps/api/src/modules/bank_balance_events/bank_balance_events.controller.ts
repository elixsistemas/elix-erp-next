import type { FastifyReply, FastifyRequest } from "fastify";
import * as service from "./bank_balance_events.service";
import { IdParamSchema } from "../../config/params";
import { BankBalanceEventCreateSchema, BankBalanceEventListQuerySchema } from "./bank_balance_events.schemas";


export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const query = BankBalanceEventListQuerySchema.parse(req.query);

  const data = await service.list(companyId, query);
  return rep.send(data);
}

export async function create(req: FastifyRequest, rep: FastifyReply) {
  if (!req.auth?.companyId) {
    return rep.status(401).send({ message: "Unauthorized" });
  }

  const companyId = req.auth.companyId;
  const body = BankBalanceEventCreateSchema.parse(req.body);

  const created = await service.create({ companyId, ...body });
  return rep.code(201).send(created);
}

export async function remove(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const removed = await service.remove(companyId, id);
  if (!removed) return rep.code(404).send({ message: "Not found" });

  return rep.send({ ok: true });
}
