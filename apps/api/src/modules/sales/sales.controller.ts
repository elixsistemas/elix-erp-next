import type { FastifyReply, FastifyRequest } from "fastify";
import { IdParamSchema } from "../../config/params";
import * as service from "./sales.service";

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  return rep.send(await service.list(companyId));
}

export async function get(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const data = await service.get(companyId, id);
  if (!data) return rep.code(404).send({ message: "Sale not found" });

  return rep.send(data);
}

export async function fromQuote(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params); // id = quoteId

  const result = await service.convertFromQuote(companyId, id);

  if ("error" in result) {
    const map: Record<string, [number, string]> = {
      QUOTE_NOT_FOUND: [404, "Quote not found"],
      QUOTE_CANCELLED: [400, "Quote is cancelled"],
      QUOTE_ALREADY_APPROVED: [400, "Quote already approved"],
      QUOTE_EMPTY: [400, "Quote has no items"]
    };
    const [code, msg] = map[(result as any).error] ?? [400, "Cannot convert quote"];
    return rep.code(code).send({ message: msg });
  }

  return rep.code(201).send((result as any).data);
}
