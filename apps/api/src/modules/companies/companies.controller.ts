import type { FastifyReply, FastifyRequest } from "fastify";
import { CompanyCreateSchema, CompanyUpdateSchema } from "./companies.schema";
import * as service from "./companies.service";
import { IdParamSchema } from "../../config/params";
import { getPool } from "../../config/db";
import sql from "mssql";

// tamanho máximo: 300 KB
const MAX_BYTES = 300 * 1024;

export async function uploadLogo(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;

  // Fastify precisa do plugin @fastify/multipart
  const data = await (req as any).file();
  if (!data) return rep.code(400).send({ error: "MISSING_FILE", message: "Nenhum arquivo enviado" });

  const mime = data.mimetype as string;
  if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(mime))
    return rep.code(400).send({ error: "INVALID_TYPE", message: "Tipo não permitido. Use PNG, JPG, WEBP ou SVG." });

  // lê o buffer completo
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of data.file) {
    size += chunk.length;
    if (size > MAX_BYTES) {
      return rep.code(400).send({ error: "FILE_TOO_LARGE", message: "Imagem maior que 300 KB" });
    }
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${mime};base64,${base64}`;

  const pool = await getPool();
  await pool.request()
    .input("company_id",   sql.Int,          companyId)
    .input("logo_base64",  sql.NVarChar,      dataUrl)
    .input("logo_mime",    sql.VarChar,       mime)
    .input("updated_at",   sql.DateTime2,     new Date())
    .query(`
      UPDATE dbo.companies
      SET logo_base64 = @logo_base64,
          logo_mime   = @logo_mime,
          updated_at  = @updated_at
      WHERE id = @company_id
    `);

  return rep.send({ ok: true, logo_url: dataUrl });
}

export async function deleteLogo(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const pool = await getPool();
  await pool.request()
    .input("company_id", sql.Int, companyId)
    .query(`
      UPDATE dbo.companies
      SET logo_base64 = NULL, logo_mime = NULL, updated_at = SYSUTCDATETIME()
      WHERE id = @company_id
    `);
  return rep.send({ ok: true });
}

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const company = await service.get(companyId);
  return rep.send(company ? [company] : []);
}

export async function get(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const company = await service.get(companyId);
  if (!company) return rep.code(404).send({ message: "Company not found" });
  return rep.send(company);
}


export async function create(req: FastifyRequest, rep: FastifyReply) {
  const isAdmin = req.auth?.roles?.includes("admin") || req.auth?.roles?.includes("ADMIN");
  if (!isAdmin) return rep.code(403).send({ message: "Forbidden" });

  const payload = CompanyCreateSchema.parse(req.body);
  const created = await service.create(payload);
  return rep.code(201).send(created);
}

export async function update(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const payload = CompanyUpdateSchema.parse(req.body);

  const r = await service.update(companyId, payload);

  if ("error" in r) {
    if (r.error === "BANK_ACCOUNT_INVALID") {
      return rep.code(409).send({ message: "Invalid bank account for this company" });
    }
    return rep.code(404).send({ message: "Company not found" });
  }

  return rep.send(r.data);
}

export async function remove(req: FastifyRequest, rep: FastifyReply) {
  const { id } = IdParamSchema.parse(req.params);

  const ok = await service.remove(id);
  if (!ok) return rep.code(404).send({ message: "Company not found" });

  return rep.code(204).send();
}