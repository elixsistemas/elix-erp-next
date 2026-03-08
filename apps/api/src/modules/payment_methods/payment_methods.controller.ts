import type { FastifyReply, FastifyRequest } from "fastify";
import { IdParamSchema } from "../../config/params";
import {
  ListPaymentMethodsQuerySchema,
  PaymentMethodCreateSchema,
  PaymentMethodUpdateSchema,
} from "./payment_methods.schema";
import * as service from "./payment_methods.service";

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const q = ListPaymentMethodsQuerySchema.parse((req.query ?? {}) as any);
  const active = q.active === "1" ? true : q.active === "0" ? false : undefined;

  return rep.send(await service.list(companyId, active));
}

export async function get(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const row = await service.get(companyId, id);
  if (!row) return rep.code(404).send({ message: "Payment method not found" });

  return rep.send(row);
}

export async function create(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const body = PaymentMethodCreateSchema.parse(req.body);

  const created = await service.create(companyId, body);
  return rep.code(201).send(created);
}

export async function update(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);
  const body = PaymentMethodUpdateSchema.parse(req.body);

  const updated = await service.update(companyId, id, body);
  if (!updated) return rep.code(404).send({ message: "Payment method not found" });

  return rep.send(updated);
}

export async function desativar(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const removed = await service.desativar(companyId, id);
  if (!removed) return rep.code(404).send({ message: "Payment method not found" });

  return rep.send({ ok: true });
}

export async function activate(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const activated = await service.activate(companyId, id);
  if (!activated) {
    return rep.code(404).send({ message: "Payment method not found or already active" });
  }

  return rep.send({ ok: true });
}