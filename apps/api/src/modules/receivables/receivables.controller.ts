import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import * as service from "./receivables.service";
import { IdParamSchema } from "../../config/params";

const FromSaleSchema = z.object({
  bankAccountId: z.number(),
  dueDate: z.string(),
  documentNo: z.string().nullable().optional(),
  note: z.string().nullable().optional()
});

export async function fromSale(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);
  const body = FromSaleSchema.parse(req.body);

  const result = await service.createFromSale({
    companyId,
    saleId: id,
    bankAccountId: body.bankAccountId,
    dueDate: body.dueDate,
    documentNo: body.documentNo ?? null,
    note: body.note ?? null
  });

    if ("error" in result) {
    const error = result.error as
        | "SALE_NOT_FOUND"
        | "RECEIVABLE_ALREADY_EXISTS";

    const map: Record<typeof error, [number, string]> = {
        SALE_NOT_FOUND: [404, "Venda não encontrada"],
        RECEIVABLE_ALREADY_EXISTS: [409, "Já existe um título gerado para esta venda"]
    };

    const [code, msg] = map[error];
    return rep.code(code).send({ message: msg });
    }

  return rep.code(201).send(result.data);
}

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  return rep.send(await service.list(companyId));
}

export async function get(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const data = await service.get(companyId, id);
  if (!data) return rep.code(404).send({ message: "Título não encontrado" });

  return rep.send(data);
}

export async function pay(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const result = await service.pay(companyId, id);

  if ("error" in result) {
    return rep.code(409).send({ message: "Somente títulos em aberto podem ser pagos" });
  }

  return rep.send(result.data);
}

export async function cancel(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const result = await service.cancel(companyId, id);

  if ("error" in result) {
    return rep.code(409).send({ message: "Somente títulos em aberto podem ser cancelados" });
  }

  return rep.send(result.data);
}
