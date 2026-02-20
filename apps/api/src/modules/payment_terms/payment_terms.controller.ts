import type { FastifyReply, FastifyRequest } from "fastify";
import { IdParamSchema } from "../../config/params";
import {
  ListPaymentTermsQuerySchema,
  PaymentTermCreateSchema,
  PaymentTermUpdateSchema
} from "./payment_terms.schema";
import * as service from "./payment_terms.service";

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const q = ListPaymentTermsQuerySchema.parse((req.query ?? {}) as any);

  const active =
    q.active === "1" ? true :
    q.active === "0" ? false :
    undefined;

  return rep.send(await service.list(companyId, active));
}

export async function get(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const row = await service.get(companyId, id);
  if (!row) return rep.code(404).send({ message: "Payment term not found" });

  return rep.send(row);
}

export async function create(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const body = PaymentTermCreateSchema.parse(req.body);

  const created = await service.create(companyId, body);
  return rep.code(201).send(created);
}

export async function update(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);
  const body = PaymentTermUpdateSchema.parse(req.body);

  const updated = await service.update(companyId, id, body);
  if (!updated) return rep.code(404).send({ message: "Payment term not found" });

  return rep.send(updated);
}
