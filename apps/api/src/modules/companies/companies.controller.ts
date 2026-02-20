import type { FastifyReply, FastifyRequest } from "fastify";
import { CompanyCreateSchema, CompanyUpdateSchema } from "./companies.schema";
import * as service from "./companies.service";
import { IdParamSchema } from "../../config/params";

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const company = await service.get(companyId);
  return rep.send(company ? [company] : []);
}

export async function get(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const company = await service.get(companyId);
  if (!company) return rep.code(404).send({ message: "Company not found" });
  return rep.send(company);
}

// ⚠️ opcional: só admin
export async function create(req: FastifyRequest, rep: FastifyReply) {
  if (req.auth?.role !== "ADMIN") {
    return rep.code(403).send({ message: "Forbidden" });
  }
  const payload = CompanyCreateSchema.parse(req.body);
  const created = await service.create(payload);
  return rep.code(201).send(created);
}

export async function update(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const payload = CompanyUpdateSchema.parse(req.body);

  const r = await service.update(companyId, payload);

  if ("error" in r) {
    if (r.error === "BANK_ACCOUNT_INVALID") {
      return rep.code(409).send({ message: "Invalid bank account for this company" });
    }
    return rep.code(404).send({ message: "Company not found" });
  }

  return rep.send(r.data);
}

// ⚠️ opcional: só admin
export async function remove(req: FastifyRequest, rep: FastifyReply) {
  const { id } = IdParamSchema.parse(req.params);

  if (req.auth?.role !== "ADMIN") {
    return rep.code(403).send({ message: "Forbidden" });
  }

  const ok = await service.remove(id);
  if (!ok) return rep.code(404).send({ message: "Company not found" });
  return rep.code(204).send();
}
