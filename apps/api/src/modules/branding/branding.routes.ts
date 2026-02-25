// apps/api/src/modules/branding/branding.routes.ts
import type { FastifyInstance } from "fastify";
import type { preHandlerHookHandler } from "fastify";
import * as controller from "./branding.controller";
import type { BrandingQuery } from "./branding.schemas";
import { requireAuth, requirePermission } from "../../config/prehandlers";

type CompanyQuery = { companyId: number };

export async function brandingRoutes(app: FastifyInstance) {
  // ✅ Público: usado antes do login (tenant por query/host/header)
  app.get<{ Querystring: BrandingQuery }>("/branding", controller.branding);

  // ✅ Protegido: usado depois do login (companyId)
  const readCompanyBranding: preHandlerHookHandler[] = [
    requireAuth,
    requirePermission("branding.read"),
  ];

  app.get<{ Querystring: CompanyQuery }>(
    "/branding/company",
    { preHandler: readCompanyBranding },
    controller.brandingByCompanyId
  );
}