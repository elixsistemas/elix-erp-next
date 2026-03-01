import type { FastifyInstance } from "fastify";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import * as controller from "./fiscal.controller";

type IdParams = { id: string };

export async function fiscalRoutes(app: FastifyInstance) {
  // CFOP
  app.get("/fiscal/cfop", { preHandler: [requireAuth, requirePermission("fiscal_cfop.read")] }, controller.listCfop);

  app.post("/fiscal/cfop", { preHandler: [requireAuth, requirePermission("fiscal_cfop.create")] }, controller.createCfop);

  app.patch<{ Params: IdParams }>(
    "/fiscal/cfop/:id",
    { preHandler: [requireAuth, requirePermission("fiscal_cfop.update")] },
    controller.updateCfop
  );

  app.patch<{ Params: IdParams }>(
    "/fiscal/cfop/:id/toggle",
    { preHandler: [requireAuth, requirePermission("fiscal_cfop.toggle")] },
    controller.toggleCfop
  );

  app.post("/fiscal/cfop/import", { preHandler: [requireAuth, requirePermission("fiscal_import.create")] }, controller.importCfop);

  // NCM
  app.get("/fiscal/ncm", { preHandler: [requireAuth, requirePermission("fiscal_ncm.read")] }, controller.listNcm);

  app.post("/fiscal/ncm", { preHandler: [requireAuth, requirePermission("fiscal_ncm.create")] }, controller.createNcm);

  app.patch<{ Params: IdParams }>(
    "/fiscal/ncm/:id",
    { preHandler: [requireAuth, requirePermission("fiscal_ncm.update")] },
    controller.updateNcm
  );

  app.patch<{ Params: IdParams }>(
    "/fiscal/ncm/:id/toggle",
    { preHandler: [requireAuth, requirePermission("fiscal_ncm.toggle")] },
    controller.toggleNcm
  );

  app.post("/fiscal/ncm/import", { preHandler: [requireAuth, requirePermission("fiscal_import.create")] }, controller.importNcm);

  app.post(
    "/fiscal/issue",
    { preHandler: [requireAuth, requirePermission("fiscal_issue.create")] },
    controller.issueBySale
  );

  app.get(
    "/fiscal/by-sale",
    { preHandler: [requireAuth, requirePermission("fiscal_documents.read")] },
    controller.listDocsBySale
  );

  // CFOP upload
  app.post(
    "/fiscal/cfop/import-file",
    { preHandler: [requireAuth, requirePermission("fiscal_import.create")] },
    controller.importCfopFile
  );

  // NCM upload
  app.post(
    "/fiscal/ncm/import-file",
    { preHandler: [requireAuth, requirePermission("fiscal_import.create")] },
    controller.importNcmFile
  );

}