import type { FastifyReply, FastifyRequest } from "fastify";
import { IdParamSchema } from "../../config/params";
import {
  QuoteCreateSchema,
  QuoteListQuerySchema,
  QuoteUpdateSchema,
} from "./quotes.schema";
import * as service from "./quotes.service";

type IdParams = { id: string };

function hasError(x: unknown): x is { error: string } {
  return typeof x === "object" && x !== null && "error" in x;
}

function mapServiceError(rep: FastifyReply, err: string) {
  if (err === "CUSTOMER_NOT_FOUND")
    return rep.code(404).send({ error: err, message: "Customer not found for this company" });

  if (err === "PRODUCT_NOT_FOUND")
    return rep.code(404).send({ error: err, message: "One or more products not found for this company" });

  if (err === "QUOTE_LOCKED")
    return rep.code(409).send({ error: err, message: "Quote is not editable (status is not draft)" });

  if (err === "INVALID_STATUS")
    return rep.code(409).send({ error: err, message: "Invalid status transition" });

  return rep.code(400).send({ error: err, message: "Request could not be processed" });
}

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const query = QuoteListQuerySchema.parse(req.query ?? {});
  const rows = await service.list(companyId, query);
  return rep.send(rows);
}

export async function get(
  req: FastifyRequest<{ Params: IdParams }>,
  rep: FastifyReply
) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const data = await service.get(companyId, id);
  if (!data) return rep.code(404).send({ error: "QUOTE_NOT_FOUND", message: "Quote not found" });

  return rep.send(data);
}

export async function create(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const payload = QuoteCreateSchema.parse(req.body);

  const result = await service.create(companyId, payload);

  if (hasError(result)) return mapServiceError(rep, result.error);

  return rep.code(201).send((result as { data: unknown }).data);
}

export async function update(
  req: FastifyRequest<{ Params: IdParams }>,
  rep: FastifyReply
) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);
  const payload = QuoteUpdateSchema.parse(req.body);

  const result = await service.update(companyId, id, payload);

  if (!result) return rep.code(404).send({ error: "QUOTE_NOT_FOUND", message: "Quote not found" });
  if (hasError(result)) return mapServiceError(rep, result.error);

  return rep.send(result);
}

export async function approve(
  req: FastifyRequest<{ Params: IdParams }>,
  rep: FastifyReply
) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const result = await service.approve(companyId, id);

  if (!result) return rep.code(404).send({ error: "QUOTE_NOT_FOUND", message: "Quote not found" });
  if (hasError(result)) return mapServiceError(rep, result.error);

  return rep.send(result);
}

export async function cancel(
  req: FastifyRequest<{ Params: IdParams }>,
  rep: FastifyReply
) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const result = await service.cancel(companyId, id);

  if (!result) return rep.code(404).send({ error: "QUOTE_NOT_FOUND", message: "Quote not found" });
  if (hasError(result)) return mapServiceError(rep, result.error);

  return rep.send(result);
}
