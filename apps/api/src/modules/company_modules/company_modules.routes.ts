import type { FastifyInstance } from "fastify";
import * as controller from "./company_modules.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import type { CompanyModulesUpdateBody } from "./company_modules.schema";

export async function companyModulesRoutes(app: FastifyInstance) {
  app.get(
    "/admin/company-modules/catalog",
    { preHandler: [requireAuth, requirePermission("company_modules.read")] },
    controller.listCatalog
  );

  app.get(
    "/company/modules",
    { preHandler: [requireAuth, requirePermission("company_modules.read")] },
    controller.listEnabled
  );

  app.put<{ Body: CompanyModulesUpdateBody }>(
    "/admin/company-modules",
    { preHandler: [requireAuth, requirePermission("company_modules.manage")] },
    controller.update
  );

  app.put<{ Body: CompanyModulesUpdateBody }>(
    "/company/modules",
    { preHandler: [requireAuth, requirePermission("company_modules.manage")] },
    controller.update
  );
}