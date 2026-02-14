import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { IdParamSchema } from "../../config/params";
import * as service from "./accounts_receivable.service";

const CreateSchema = z.object({
  customerId: z.number().int().positive(),
  saleId: z.number().int().positive().nullable().optional(),
  bankAccountId: z.number().int().positive(),
  dueDate: z.string().min(10).max(10), // YYYY-MM-DD
  amount: z.number().positive(),
  documentNo: z.string().max(40).optional().nullable(),
  note: z.string().max(500).optional().nullable()
});

const UpdateSchema = z.object({
  dueDate: z.string().min(10).max(10).optional(),
  documentNo: z.string().max(40).optional().nullable(),
  note: z.string().max(500).optional().nullable()
});

const FromSaleSchema = z.object({
  bankAccountId: z.number().int().positive(),
  dueDate: z.string().min(10).max(10),
  documentNo: z.string().max(40).optional().nullable(),
  note: z.string().max(500).optional().nullable()
});

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  return rep.send(await service.list(companyId));
}

export async function get(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const data = await service.get(companyId, id);
  if (!data) return rep.code(404).send({ message: "Receivable not found" });

  return rep.send(data);
}

export async function update(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);
  const body = UpdateSchema.parse(req.body);

  const updated = await service.update({
    companyId,
    id,
    dueDate: body.dueDate,
    documentNo: body.documentNo,
    note: body.note
  });

  if (!updated) return rep.code(404).send({ message: "Receivable not found" });
  return rep.send(updated);
}

export async function cancel(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const result = await service.cancel(companyId, id);

  if ("error" in result) {
    const map: Record<string, [number, string]> = {
      NOT_FOUND: [404, "Receivable not found"],
      NOT_OPEN: [409, "Only open receivables can be cancelled"]
    };
    const [code, msg] = map[(result as any).error] ?? [400, "Cannot cancel receivable"];
    return rep.code(code).send({ message: msg });
  }

  return rep.send((result as any).data);
}

export async function fromSale(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params); // saleId
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
    const map: Record<string, [number, string]> = {
      SALE_NOT_FOUND: [404, "Sale not found"]
    };
    const [code, msg] = map[(result as any).error] ?? [400, "Cannot create receivable"];
    return rep.code(code).send({ message: msg });
  }

  return rep.code(201).send((result as any).data);
}

export async function issueMock(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const result = await service.issueMock(companyId, id);

  if ("error" in result) {
    const map: Record<string, [number, string]> = {
      NOT_FOUND: [404, "Receivable not found"],
      NOT_OPEN: [409, "Only open receivables can be issued"]
    };
    const [code, msg] = map[(result as any).error] ?? [400, "Cannot issue receivable"];
    return rep.code(code).send({ message: msg });
  }

  return rep.send((result as any).data);
}
