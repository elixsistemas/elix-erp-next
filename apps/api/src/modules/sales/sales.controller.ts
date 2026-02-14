import type { FastifyReply, FastifyRequest } from "fastify";
import { IdParamSchema } from "../../config/params";
import * as service from "./sales.service";
import { z } from "zod";

const ListQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  customerId: z.coerce.number().int().positive().optional()
});

const UpdateBodySchema = z.object({
  notes: z.string().max(500).nullable().optional(),
  paymentMethodId: z.number().int().positive().nullable().optional(),
  paymentTermId: z.number().int().positive().nullable().optional()
});

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const q = ListQuerySchema.parse((req.query ?? {}) as any);

  const data = await service.list({
    companyId,
    from: q.from,
    to: q.to,
    customerId: q.customerId
  });

  return rep.send(data);
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
  const { id } = IdParamSchema.parse(req.params); // quoteId

  try {
    const result = await service.convertFromQuote(companyId, id);

    if ("error" in result) {
      const map: Record<string, [number, string]> = {
        QUOTE_NOT_FOUND: [404, "Quote not found"],
        QUOTE_CANCELLED: [400, "Quote is cancelled"],
        QUOTE_ALREADY_APPROVED: [409, "Quote already processed"],
        QUOTE_EMPTY: [400, "Quote has no items"]
      };

      const [code, msg] = map[(result as any).error] ?? [400, "Cannot convert quote"];
      return rep.code(code).send({ message: msg });
    }

    return rep.code(201).send((result as any).data);
  } catch (err: any) {
    const msg = String(err?.message ?? "");

    if (msg.includes("Insufficient stock")) {
      return rep.code(409).send({ message: "Insufficient stock" });
    }

    if (msg.includes("Quote already processed")) {
      return rep.code(409).send({ message: "Quote already processed" });
    }

    throw err;
  }
}

export async function cancel(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params); // saleId

  const result = await service.cancel(companyId, id);

  if ("error" in result) {
    const map: Record<string, [number, string]> = {
      SALE_NOT_FOUND: [404, "Sale not found"],
      SALE_ALREADY_CANCELLED: [409, "Sale already cancelled"],
      SALE_NOT_OPEN: [409, "Only open sales can be cancelled"]
    };

    const [code, msg] = map[(result as any).error] ?? [400, "Cannot cancel sale"];
    return rep.code(code).send({ message: msg });
  }

  return rep.send((result as any).data);
}

export async function update(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);
  const body = UpdateBodySchema.parse(req.body);

  const updated = await service.update({
    companyId,
    saleId: id,
    notes: body.notes,
    paymentMethodId: body.paymentMethodId,
    paymentTermId: body.paymentTermId
  });

  if (!updated) return rep.code(404).send({ message: "Sale not found" });
  return rep.send(updated);
}
