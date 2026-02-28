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

  app.post("/fiscal/cfop/import", { preHandler: [requireAuth, requirePermission("fiscal_import.run")] }, controller.importCfop);

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

  app.post("/fiscal/ncm/import", { preHandler: [requireAuth, requirePermission("fiscal_import.run")] }, controller.importNcm);
}