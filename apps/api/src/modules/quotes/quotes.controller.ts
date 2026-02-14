import type { FastifyReply, FastifyRequest } from "fastify";
import { QuoteCreateSchema, QuoteUpdateSchema } from "./quotes.schema";
import { IdParamSchema } from "../../config/params";
import * as service from "./quotes.service";

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const data = await service.list(companyId);
  return rep.send(data);
}

export async function get(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const data = await service.get(companyId, id);
  if (!data) return rep.code(404).send({ message: "Quote not found" });

  return rep.send(data);
}

export async function create(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const payload = QuoteCreateSchema.parse(req.body);

  const result = await service.create(companyId, payload);

  if ("error" in result) {
    if (result.error === "CUSTOMER_NOT_FOUND")
      return rep.code(404).send({ message: "Customer not found for this company" });

    if (result.error === "PRODUCT_NOT_FOUND")
      return rep.code(404).send({ message: "One or more products not found for this company" });
  }

  return rep.code(201).send((result as any).data);
}

export async function update(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);
  const payload = QuoteUpdateSchema.parse(req.body);

  const updated = await service.update(companyId, id, payload);
  if (!updated) return rep.code(404).send({ message: "Quote not found" });

  return rep.send(updated);
}
