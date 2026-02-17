import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import * as repo from "./fiscal.repository";

const IdSchema = z.object({ id: z.coerce.number().int().positive() });

export async function emit(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdSchema.parse(req.params);

  try {
    const doc = await repo.emitFiscalDocTx({ companyId, documentId: id });
    if (!doc) return rep.code(404).send({ message: "Fiscal document not found" });
    return rep.send(doc);
  } catch (e: any) {
    const msg = String(e?.message ?? "");
    if (msg === "INVALID_STATUS") return rep.code(409).send({ message: "Cannot emit in current status" });
    throw e;
  }
}

export async function cancel(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdSchema.parse(req.params);

  try {
    const doc = await repo.cancelFiscalDocTx({ companyId, documentId: id });
    if (!doc) return rep.code(404).send({ message: "Fiscal document not found" });
    return rep.send(doc);
  } catch (e: any) {
    const msg = String(e?.message ?? "");
    if (msg === "INVALID_STATUS") return rep.code(409).send({ message: "Cannot cancel in current status" });
    throw e;
  }
}
