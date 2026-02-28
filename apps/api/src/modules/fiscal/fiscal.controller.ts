import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import * as service from "./fiscal.service";
import {
  CfopImportSchema, CfopListQuerySchema, CfopUpsertSchema,
  NcmImportSchema, NcmListQuerySchema, NcmUpsertSchema,
} from "./fiscal.schema";

type IdParams = { id: string };

function zodFail(rep: FastifyReply, err: unknown) {
  if (err instanceof ZodError) {
    return rep.code(400).send({ message: "Invalid request", issues: err.issues });
  }
  throw err;
}

// CFOP
export async function listCfop(req: FastifyRequest, rep: FastifyReply) {
  try {
    const q = CfopListQuerySchema.parse(req.query);
    const out = await service.listCfop(q);
    return rep.send(out);
  } catch (err) {
    return zodFail(rep, err);
  }
}

export async function createCfop(req: FastifyRequest, rep: FastifyReply) {
  try {
    const body = CfopUpsertSchema.parse(req.body);
    const out = await service.createCfop(body);
    return rep.code(201).send(out);
  } catch (err) {
    return zodFail(rep, err);
  }
}

export async function updateCfop(req: FastifyRequest<{ Params: IdParams }>, rep: FastifyReply) {
  try {
    const id = Number(req.params.id);
    const body = CfopUpsertSchema.partial().parse(req.body);
    const out = await service.updateCfop(id, body);
    return rep.send(out);
  } catch (err) {
    return zodFail(rep, err);
  }
}

export async function importCfop(req: FastifyRequest, rep: FastifyReply) {
  try {
    const payload = CfopImportSchema.parse(req.body);
    const out = await service.importCfop(payload.items, payload.dryRun);
    return rep.send(out);
  } catch (err) {
    return zodFail(rep, err);
  }
}

// NCM
export async function listNcm(req: FastifyRequest, rep: FastifyReply) {
  try {
    const q = NcmListQuerySchema.parse(req.query);
    const out = await service.listNcm(q);
    return rep.send(out);
  } catch (err) {
    return zodFail(rep, err);
  }
}

export async function createNcm(req: FastifyRequest, rep: FastifyReply) {
  try {
    const body = NcmUpsertSchema.parse(req.body);
    const out = await service.createNcm(body);
    return rep.code(201).send(out);
  } catch (err) {
    return zodFail(rep, err);
  }
}

export async function updateNcm(req: FastifyRequest<{ Params: IdParams }>, rep: FastifyReply) {
  try {
    const id = Number(req.params.id);
    const body = NcmUpsertSchema.partial().parse(req.body);
    const out = await service.updateNcm(id, body);
    return rep.send(out);
  } catch (err) {
    return zodFail(rep, err);
  }
}

function parseIdOr400(rep: FastifyReply, raw: string) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    rep.code(400).send({
      message: "Invalid request",
      issues: [{ path: ["id"], message: "Invalid id" }],
    });
    return null;
  }
  return id;
}

export async function toggleCfop(
  req: FastifyRequest<{ Params: IdParams }>,
  rep: FastifyReply
) {
  const id = parseIdOr400(rep, req.params.id);
  if (!id) return;
  const out = await service.toggleCfop(id);
  return rep.send(out);
}

export async function toggleNcm(
  req: FastifyRequest<{ Params: IdParams }>,
  rep: FastifyReply
) {
  const id = parseIdOr400(rep, req.params.id);
  if (!id) return;
  const out = await service.toggleNcm(id);
  return rep.send(out);
}

export async function importNcm(req: FastifyRequest, rep: FastifyReply) {
  try {
    const payload = NcmImportSchema.parse(req.body);
    const out = await service.importNcm(payload.items, payload.dryRun);
    return rep.send(out);
  } catch (err) {
    return zodFail(rep, err);
  }
}