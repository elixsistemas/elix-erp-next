import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { IdParamSchema } from "../../config/params";
import * as service from "./bank_accounts.service";

const CreateSchema = z.object({
  bankCode: z.string().min(1).max(10),
  name: z.string().min(2).max(120),
  agency: z.string().max(20).optional().nullable(),
  account: z.string().max(30).optional().nullable(),
  accountDigit: z.string().max(5).optional().nullable(),
  convenio: z.string().max(30).optional().nullable(),
  wallet: z.string().max(20).optional().nullable(),
  settings: z.any().optional().nullable(),
  active: z.boolean().optional()
});

const UpdateSchema = CreateSchema.partial();

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const data = await service.list(companyId);
  return rep.send(data);
}

export async function get(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const data = await service.get(companyId, id);
  if (!data) return rep.code(404).send({ message: "Bank account not found" });

  return rep.send(data);
}

export async function create(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const body = CreateSchema.parse(req.body);

  const created = await service.create({
    companyId,
    ...body
  });

  return rep.code(201).send(created);
}

export async function update(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);
  const body = UpdateSchema.parse(req.body);

  const updated = await service.update({ companyId, id, ...body });
  if (!updated) return rep.code(404).send({ message: "Bank account not found" });

  return rep.send(updated);
}

export async function remove(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const ok = await service.remove(companyId, id);
  if (!ok) return rep.code(404).send({ message: "Bank account not found" });

  return rep.send({ ok: true });
}
