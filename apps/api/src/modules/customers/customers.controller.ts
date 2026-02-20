import type { FastifyReply, FastifyRequest } from "fastify";
import { CustomerCreateSchema, CustomerUpdateSchema, CustomerListQuerySchema } from "./customers.schema";
import * as service from "./customers.service";
import { IdParamSchema } from "../../config/params";

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const q = CustomerListQuerySchema.parse(req.query);

  const data = await service.list({
    companyId,
    q: q.q,
    limit: q.limit,
    active: q.active,
  });

  return rep.send(data);
}

export async function get(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const customer = await service.get(companyId, id);
  if (!customer) return rep.code(404).send({ message: "Customer not found" });

  return rep.send(customer);
}

export async function create(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const payload = CustomerCreateSchema.parse(req.body);

  const created = await service.create(companyId, payload);

  if (created && typeof created === "object" && "error" in created) {
    if (created.error === "DOCUMENT_ALREADY_EXISTS") {
      return rep.code(409).send({ message: "Customer document already exists" });
    }
    return rep.code(400).send({ message: "Cannot create customer" });
  }

  return rep.code(201).send(created);
}

export async function update(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);
  const payload = CustomerUpdateSchema.parse(req.body);

  const updated = await service.update(companyId, id, payload);

  if (!updated) return rep.code(404).send({ message: "Customer not found" });

  if (typeof updated === "object" && "error" in updated) {
    if (updated.error === "DOCUMENT_ALREADY_EXISTS") {
      return rep.code(409).send({ message: "Customer document already exists" });
    }
    return rep.code(400).send({ message: "Cannot update customer" });
  }

  return rep.send(updated);
}

export async function remove(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const ok = await service.remove(companyId, id);
  if (!ok) return rep.code(404).send({ message: "Customer not found" });

  return rep.code(204).send();
}
