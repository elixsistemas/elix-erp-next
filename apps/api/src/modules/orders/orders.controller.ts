import type { FastifyReply, FastifyRequest } from "fastify";
import { OrderCreateSchema, OrderListQuerySchema, OrderUpdateSchema } from "./orders.schema";
import * as service from "./orders.service";

type IdParams  = { id: string };
type QidParams = { id: string };   // quoteId na rota from-quote

function hasError(x: unknown): x is { error: string } {
  return typeof x === "object" && x !== null && "error" in x;
}

function mapError(rep: FastifyReply, code: string) {
  const map: Record<string, [number, string]> = {
    ORDER_NOT_FOUND:                [404, "Pedido não encontrado"],
    CUSTOMER_NOT_FOUND:             [404, "Cliente não encontrado nesta empresa"],
    PRODUCT_NOT_FOUND:              [404, "Um ou mais produtos não encontrados nesta empresa"],
    ORDER_LOCKED:                   [409, "Pedido não pode ser editado (status ≠ draft)"],
    INVALID_STATUS:                 [409, "Transição de status inválida"],
    QUOTE_NOT_FOUND_OR_NOT_APPROVED:[409, "Orçamento não encontrado ou não aprovado"],
  };
  const [status, message] = map[code] ?? [400, "Erro na requisição"];
  return rep.code(status).send({ error: code, message });
}

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const query  = OrderListQuerySchema.parse(req.query);
  const result = await service.list(req.auth!.companyId, query);
  return rep.send(result.data);
}

export async function get(req: FastifyRequest<{ Params: IdParams }>, rep: FastifyReply) {
  const result = await service.get(req.auth!.companyId, Number(req.params.id));
  if (hasError(result)) return mapError(rep, result.error);
  return rep.send(result.data);
}

export async function create(req: FastifyRequest, rep: FastifyReply) {
  const body   = OrderCreateSchema.parse(req.body);
  const result = await service.create(req.auth!.companyId, body);
  if (hasError(result)) return mapError(rep, result.error);
  return rep.code(201).send(result.data);
}

export async function update(req: FastifyRequest<{ Params: IdParams }>, rep: FastifyReply) {
  const body   = OrderUpdateSchema.parse(req.body);
  const result = await service.update(req.auth!.companyId, Number(req.params.id), body);
  if (hasError(result)) return mapError(rep, result.error);
  return rep.send(result.data);
}

export async function confirm(req: FastifyRequest<{ Params: IdParams }>, rep: FastifyReply) {
  const result = await service.confirm(req.auth!.companyId, Number(req.params.id));
  if (hasError(result)) return mapError(rep, result.error);
  return rep.send(result.data);
}

export async function cancel(req: FastifyRequest<{ Params: IdParams }>, rep: FastifyReply) {
  const result = await service.cancel(req.auth!.companyId, Number(req.params.id));
  if (hasError(result)) return mapError(rep, result.error);
  return rep.send(result.data);
}

export async function createFromQuote(
  req: FastifyRequest<{ Params: QidParams }>,
  rep: FastifyReply
) {
  const result = await service.createFromQuote(req.auth!.companyId, Number(req.params.id));
  if (hasError(result)) return mapError(rep, result.error);
  return rep.code(201).send(result.data);
}