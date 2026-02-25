// apps/api/src/modules/company_modules/company_modules.routes.ts
import type { FastifyInstance } from "fastify";
import * as controller from "./company_modules.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import type { CompanyModulesUpdateBody } from "./company_modules.schema";

export async function companyModulesRoutes(app: FastifyInstance) {
  // listar módulos habilitados/visíveis no tenant atual
  app.get(
    "/company/modules",
    { preHandler: [requireAuth, requirePermission("company_modules.read")] },
    controller.list
  );

  // atualizar “liga/desliga” módulos do tenant atual
  app.put<{ Body: CompanyModulesUpdateBody }>(
    "/company/modules",
    { preHandler: [requireAuth, requirePermission("company_modules.manage")] },
    controller.update
  );
}