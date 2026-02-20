import type { FastifyReply, FastifyRequest } from "fastify";
import { IdParamSchema } from "../../config/params";
import { SupplierCreateSchema, SupplierListQuerySchema, SupplierUpdateSchema } from "./suppliers.schema";
import * as service from "./suppliers.service";

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const q = SupplierListQuerySchema.parse(req.query ?? {});
  const rows = await service.list(companyId, q);
  return rep.send(rows);
}

export async function get(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);
  const row = await service.get(companyId, id);
  if (!row) return rep.code(404).send({ error: "NOT_FOUND" });
  return rep.send(row);
}

export async function create(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const body = SupplierCreateSchema.parse(req.body);

  const result = await service.create(companyId, body);
  if ((result as any)?.error === "DOCUMENT_ALREADY_EXISTS") {
    return rep.code(409).send({ error: "DOCUMENT_ALREADY_EXISTS" });
  }

  return rep.code(201).send((result as any).data);
}

export async function update(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);
  const body = SupplierUpdateSchema.parse(req.body);

  const result = await service.update(companyId, id, body);
  if ((result as any)?.error === "DOCUMENT_ALREADY_EXISTS") {
    return rep.code(409).send({ error: "DOCUMENT_ALREADY_EXISTS" });
  }

  const row = (result as any).data ?? null;
  if (!row) return rep.code(404).send({ error: "NOT_FOUND" });

  return rep.send(row);
}

export async function remove(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const ok = await service.remove(companyId, id);
  if (!ok) return rep.code(404).send({ error: "NOT_FOUND" });

  return rep.code(204).send();
}
