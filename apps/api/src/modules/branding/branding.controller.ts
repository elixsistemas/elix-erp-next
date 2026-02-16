import type { FastifyRequest, FastifyReply } from "fastify";
import { brandingQuerySchema } from "./branding.schemas";
import { getBrandingByCompanyId, getBrandingBySlug } from "./branding.service";

function resolve(req: FastifyRequest) {
  const parsed = brandingQuerySchema.safeParse(req.query);
  const q = parsed.success ? parsed.data : {};

  const companyId = q.companyId;
  if (companyId) return { companyId };

  const slugFromQuery = q.company?.trim().toLowerCase();
  if (slugFromQuery) return { slug: slugFromQuery };

  const h = req.headers["x-tenant"];
  if (typeof h === "string" && h.trim()) return { slug: h.trim().toLowerCase() };

  const host = (req.headers.host ?? "").split(":")[0];
  const parts = host.split(".");
  if (parts.length >= 3 && parts[0]) return { slug: parts[0].toLowerCase() };

  return { slug: "elix" };
}

export async function branding(req: FastifyRequest, reply: FastifyReply) {
  const r = resolve(req);
  const data =
    "companyId" in r
      ? await getBrandingByCompanyId(r.companyId)
      : await getBrandingBySlug(r.slug);

  return reply.send(data);
}
