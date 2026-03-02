import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError, z } from "zod";
import * as salesFiscalRepo from "../sales/sales.fiscal.repository";
import * as service from "./fiscal.service";
import {
  CfopImportSchema, CfopListQuerySchema, CfopUpsertSchema,
  NcmImportSchema, NcmListQuerySchema, NcmUpsertSchema,
  CestImportSchema, CestListQuerySchema, CestUpsertSchema,
} from "./fiscal.schema";

import { parseNcmUploadToItems, parseCfopUploadToItems, parseCestUploadToItems } from "./fiscal.import-file";

const DryRunQuerySchema = z.object({
  dryRun: z.coerce.number().int().optional(), // 1/0
});

function getDryRun(req: FastifyRequest) {
  const q = DryRunQuerySchema.parse(req.query);
  return q.dryRun === 1;
}

export async function importNcmFile(req: FastifyRequest, rep: FastifyReply) {
  try {
    const dryRun = getDryRun(req);

    const file = await (req as any).file();
    if (!file) return rep.code(400).send({ message: "Arquivo não enviado" });

    const buf = await file.toBuffer();
    const filename = String(file.filename ?? "ncm");

    const items = await parseNcmUploadToItems(buf, filename);

    // ✅ valida ANTES de importar
    const parsed = NcmImportSchema.parse({ dryRun, items });

    const out = await service.importNcm(parsed.items, parsed.dryRun);

    return rep.send(out);
  } catch (err) {
    return zodFail(rep, err);
  }
}

export async function importCfopFile(req: FastifyRequest, rep: FastifyReply) {
  try {
    const dryRun = getDryRun(req);

    const file = await (req as any).file();
    if (!file) return rep.code(400).send({ message: "Arquivo não enviado" });

    const buf = await file.toBuffer();
    const filename = String(file.filename ?? "cfop");

    const items = await parseCfopUploadToItems(buf, filename); // <- tem que gerar CfopCreate[]
    const out = await service.importCfop(items, dryRun);

    return rep.send(out);
  } catch (err) {
    return zodFail(rep, err);
  }
}

const IssueFiscalSchema = z.object({
  saleId: z.coerce.number().int().positive(),
  type: z.enum(["NFE", "NFSE", "BOTH"]),
});

export const ListFiscalBySaleSchema = z.object({
  saleId: z.coerce.number().int().positive(),
});

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

export async function importCestFile(req: FastifyRequest, rep: FastifyReply) {
  try {
    const dryRun = getDryRun(req);

    const file = await (req as any).file();
    if (!file) return rep.code(400).send({ message: "Arquivo não enviado" });

    const buf = await file.toBuffer();
    const filename = String(file.filename ?? "cest");

    const items = await parseCestUploadToItems(buf, filename);

    // ✅ valida ANTES de importar (mesmo padrão do NCM)
    const parsed = CestImportSchema.parse({ dryRun, items });

    const out = await service.importCest(parsed.items, parsed.dryRun);

    return rep.send(out);
  } catch (err) {
    return zodFail(rep, err);
  }
}

export async function issueBySale(req: FastifyRequest, rep: FastifyReply) {
  try {
    const companyId = req.auth!.companyId;
    const payload = IssueFiscalSchema.parse(req.body);

    const docs = await salesFiscalRepo.issueFiscalTx({
      companyId,
      saleId: payload.saleId,
      type: payload.type,
    });

    return rep.code(201).send({ documents: docs });
  } catch (err: any) {
    // mantém seu padrão de Zod
    if (err instanceof ZodError) return zodFail(rep, err);

    // erros de domínio do fiscal
    const code = String(err?.code ?? err?.message ?? "");

    if (code === "FISCAL_ALREADY_EXISTS") {
      return rep.code(409).send({
        code: "FISCAL_ALREADY_EXISTS",
        message: "Já existe um documento fiscal ativo para esta venda.",
        docType: err?.docType ?? null,
      });
    }

    if (code === "FISCAL_PREFLIGHT_FAILED") {
      return rep.code(400).send({
        code: "FISCAL_PREFLIGHT_FAILED",
        message: "A emissão foi bloqueada por validações fiscais.",
        alerts: err?.alerts ?? [],
      });
    }

    if (String(err?.message ?? "") === "SALE_NOT_FOUND") {
      return rep.code(404).send({ code: "SALE_NOT_FOUND", message: "Venda não encontrada." });
    }

    // fallback
    req.log?.error?.(err);
    return rep.code(500).send({ code: "INTERNAL_ERROR", message: "Erro interno ao emitir fiscal." });
  }
}

export async function listDocsBySale(req: FastifyRequest, rep: FastifyReply) {
  try {
    const companyId = req.auth!.companyId;
    const q = ListFiscalBySaleSchema.parse(req.query);

    const data = await salesFiscalRepo.listFiscalBySale({
      companyId,
      saleId: q.saleId,
    });

    if (!data) {
      return rep.code(404).send({ code: "SALE_NOT_FOUND", message: "Venda não encontrada." });
    }

    return rep.send(data);
  } catch (err) {
    return zodFail(rep, err);
  }
}

// CEST
export async function listCest(req: FastifyRequest, rep: FastifyReply) {
  try {
    const q = CestListQuerySchema.parse(req.query);
    const out = await service.listCest(q);
    return rep.send(out);
  } catch (err) {
    return zodFail(rep, err);
  }
}

export async function createCest(req: FastifyRequest, rep: FastifyReply) {
  try {
    const body = CestUpsertSchema.parse(req.body);
    const out = await service.createCest(body);
    return rep.code(201).send(out);
  } catch (err) {
    return zodFail(rep, err);
  }
}

export async function updateCest(req: FastifyRequest<{ Params: IdParams }>, rep: FastifyReply) {
  try {
    const id = Number(req.params.id);
    const body = CestUpsertSchema.partial().parse(req.body);
    const out = await service.updateCest(id, body);
    return rep.send(out);
  } catch (err) {
    return zodFail(rep, err);
  }
}

export async function toggleCest(
  req: FastifyRequest<{ Params: IdParams }>,
  rep: FastifyReply
) {
  const id = parseIdOr400(rep, req.params.id);
  if (!id) return;
  const out = await service.toggleCest(id);
  return rep.send(out);
}

export async function importCest(req: FastifyRequest, rep: FastifyReply) {
  try {
    const payload = CestImportSchema.parse(req.body);
    const out = await service.importCest(payload.items, payload.dryRun);
    return rep.send(out);
  } catch (err) {
    return zodFail(rep, err);
  }
}