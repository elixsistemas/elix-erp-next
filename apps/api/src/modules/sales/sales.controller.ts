import type { FastifyReply, FastifyRequest } from "fastify";
import { SaleCreateSchema, SaleListQuerySchema, SaleUpdateSchema } from "./sales.schema";
import * as service from "./sales.service";

type IdParams = { id: string };

function hasError(x: unknown): x is { error: string } {
  return typeof x === "object" && x !== null && "error" in x;
}

function mapError(rep: FastifyReply, code: string) {
  const map: Record<string, [number, string]> = {
    SALE_NOT_FOUND:                     [404, "Venda não encontrada"],
    CUSTOMER_NOT_FOUND:                 [404, "Cliente não encontrado nesta empresa"],
    PRODUCT_NOT_FOUND:                  [404, "Um ou mais produtos não encontrados nesta empresa"],
    SELLER_NOT_FOUND:                   [404, "Vendedor não encontrado ou inativo nesta empresa"],
    SALE_LOCKED:                        [409, "Venda não pode ser editada (status ≠ draft)"],
    INVALID_STATUS:                     [409, "Transição de status inválida"],
    QUOTE_NOT_FOUND_OR_NOT_APPROVED:    [409, "Orçamento não encontrado ou não aprovado"],
    ORDER_NOT_FOUND_OR_NOT_CONFIRMED:   [409, "Pedido não encontrado ou não confirmado"],
  };
  const [status, message] = map[code] ?? [400, "Erro na requisição"];
  return rep.code(status).send({ error: code, message });
}

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const query  = SaleListQuerySchema.parse(req.query);
  const result = await service.list(req.auth!.companyId, query);
  return rep.send(result.data);
}

export async function get(
  req: FastifyRequest<{ Params: IdParams }>, rep: FastifyReply
) {
  const result = await service.get(req.auth!.companyId, Number(req.params.id));
  if (hasError(result)) return mapError(rep, result.error);
  return rep.send(result.data);
}

export async function create(req: FastifyRequest, rep: FastifyReply) {
  const body   = SaleCreateSchema.parse(req.body);
  const result = await service.create(req.auth!.companyId, body);
  if (hasError(result)) return mapError(rep, result.error);
  return rep.code(201).send(result.data);
}

export async function update(
  req: FastifyRequest<{ Params: IdParams }>, rep: FastifyReply
) {
  const body   = SaleUpdateSchema.parse(req.body);
  const result = await service.update(req.auth!.companyId, Number(req.params.id), body);
  if (hasError(result)) return mapError(rep, result.error);
  return rep.send(result.data);
}

export async function complete(
  req: FastifyRequest<{ Params: IdParams }>, rep: FastifyReply
) {
  const result = await service.complete(req.auth!.companyId, Number(req.params.id));
  if (hasError(result)) return mapError(rep, result.error);
  return rep.send(result.data);
}

export async function cancel(
  req: FastifyRequest<{ Params: IdParams }>, rep: FastifyReply
) {
  const result = await service.cancel(req.auth!.companyId, Number(req.params.id));
  if (hasError(result)) return mapError(rep, result.error);
  return rep.send(result.data);
}

export async function createFromQuote(
  req: FastifyRequest<{ Params: IdParams }>, rep: FastifyReply
) {
  const result = await service.createFromQuote(req.auth!.companyId, Number(req.params.id));
  if (hasError(result)) return mapError(rep, result.error);
  return rep.code(201).send(result.data);
}

export async function createFromOrder(
  req: FastifyRequest<{ Params: IdParams }>, rep: FastifyReply
) {
  const result = await service.createFromOrder(req.auth!.companyId, Number(req.params.id));
  if (hasError(result)) return mapError(rep, result.error);
  return rep.code(201).send(result.data);
}
