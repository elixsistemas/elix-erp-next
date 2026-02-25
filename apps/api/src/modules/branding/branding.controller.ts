// apps/api/src/modules/branding/branding.controller.ts
import type { FastifyReply, FastifyRequest } from "fastify";
import { brandingQuerySchema, type BrandingQuery } from "./branding.schemas";
import { getBrandingByCompanyId, getBrandingBySlug } from "./branding.service";

type BrandingReq = FastifyRequest<{ Querystring: BrandingQuery }>;

export async function branding(req: BrandingReq, reply: FastifyReply) {
  try {
    const parsed = brandingQuerySchema.safeParse(req.query);
    const q = parsed.success ? parsed.data : {};

    // ✅ se vier companyId, resolve também (continua funcionando)
    if (q.companyId) {
      return reply.send(await getBrandingByCompanyId(q.companyId));
    }

    const slugFromQuery = q.company?.trim().toLowerCase();
    if (slugFromQuery) return reply.send(await getBrandingBySlug(slugFromQuery));

    const h = req.headers["x-tenant"];
    if (typeof h === "string" && h.trim()) return reply.send(await getBrandingBySlug(h.trim().toLowerCase()));

    const host = (req.headers.host ?? "").split(":")[0];
    const parts = host.split(".");
    if (parts.length >= 3 && parts[0]) return reply.send(await getBrandingBySlug(parts[0].toLowerCase()));

    return reply.send(await getBrandingBySlug("elix"));
  } catch (err) {
    req.log.error({ err }, "BRANDING_ERROR");
    return reply.code(500).send({ message: "Branding failed" });
  }
}

// ✅ Novo endpoint protegido
export async function brandingByCompanyId(
  req: FastifyRequest<{ Querystring: { companyId: number } }>,
  reply: FastifyReply
) {
  const companyId = Number((req.query as any).companyId);
  return reply.send(await getBrandingByCompanyId(companyId));
}