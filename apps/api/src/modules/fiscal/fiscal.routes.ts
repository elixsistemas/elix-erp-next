import type { FastifyInstance } from "fastify";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import * as controller from "./fiscal.controller";
import { requireModule } from "@/config/requireModule";

type IdParams = { id: string };

export async function fiscalRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("fiscal.rules"));
      // CFOP
      app.get("/cfop", { preHandler: [requireAuth, requirePermission("fiscal_cfop.read")] }, controller.listCfop);

      app.post("/cfop", { preHandler: [requireAuth, requirePermission("fiscal_cfop.create")] }, controller.createCfop);

      app.patch<{ Params: IdParams }>(
        "/cfop/:id",
        { preHandler: [requireAuth, requirePermission("fiscal_cfop.update")] },
        controller.updateCfop
      );

      app.patch<{ Params: IdParams }>(
        "/cfop/:id/toggle",
        { preHandler: [requireAuth, requirePermission("fiscal_cfop.toggle")] },
        controller.toggleCfop
      );

      app.post("/cfop/import", { preHandler: [requireAuth, requirePermission("fiscal_import.create")] }, controller.importCfop);

      // NCM
      app.get("/ncm", { preHandler: [requireAuth, requirePermission("fiscal_ncm.read")] }, controller.listNcm);

      app.post("/ncm", { preHandler: [requireAuth, requirePermission("fiscal_ncm.create")] }, controller.createNcm);

      app.patch<{ Params: IdParams }>(
        "/ncm/:id",
        { preHandler: [requireAuth, requirePermission("fiscal_ncm.update")] },
        controller.updateNcm
      );

      app.patch<{ Params: IdParams }>(
        "/ncm/:id/toggle",
        { preHandler: [requireAuth, requirePermission("fiscal_ncm.toggle")] },
        controller.toggleNcm
      );

      app.post("/ncm/import", { preHandler: [requireAuth, requirePermission("fiscal_import.create")] }, controller.importNcm);

      app.post("/issue", { preHandler: [requireAuth, requirePermission("fiscal_issue.create")] }, controller.issueBySale);

      app.get("/by-sale", { preHandler: [requireAuth, requirePermission("fiscal_documents.read")] }, controller.listDocsBySale);

      // CFOP upload
      app.post("/cfop/import-file", { preHandler: [requireAuth, requirePermission("fiscal_import.create")] }, controller.importCfopFile);

      // NCM upload
      app.post("/ncm/import-file", { preHandler: [requireAuth, requirePermission("fiscal_import.create")] }, controller.importNcmFile);

        // CEST
      app.get("/cest", { preHandler: [requireAuth, requirePermission("fiscal_cest.read")] }, controller.listCest);

      app.post("/cest", { preHandler: [requireAuth, requirePermission("fiscal_cest.create")] }, controller.createCest);

      app.patch<{ Params: IdParams }>("/cest/:id", { preHandler: [requireAuth, requirePermission("fiscal_cest.update")] }, controller.updateCest);

      app.patch<{ Params: IdParams }>("/cest/:id/toggle", { preHandler: [requireAuth, requirePermission("fiscal_cest.toggle")] }, controller.toggleCest);

      app.post("/cest/import", { preHandler: [requireAuth, requirePermission("fiscal_import.create")] }, controller.importCest);
      // CEST upload
      app.post("/cest/import-file", { preHandler: [requireAuth, requirePermission("fiscal_import.create")] }, controller.importCestFile);

      // ✅ FISCAIS FIXAS (READ-ONLY)
      app.get(
        "/uom",
        { preHandler: [requireAuth, requirePermission("fiscal_uom.read")] },
        controller.listUom
      );

      app.get(
        "/csosn",
        { preHandler: [requireAuth, requirePermission("fiscal_csosn.read")] },
        controller.listCsosn
      );

      app.get(
        "/icms-origem",
        { preHandler: [requireAuth, requirePermission("fiscal_icms_origem.read")] },
        controller.listIcmsOrigem
      );

      app.get(
        "/cst-icms",
        { preHandler: [requireAuth, requirePermission("fiscal_cst_icms.read")] },
        controller.listCstIcms
      );

      app.get(
        "/pis-cst",
        { preHandler: [requireAuth, requirePermission("fiscal_pis_cst.read")] },
        controller.listPisCst
      );

      app.get(
        "/cofins-cst",
        { preHandler: [requireAuth, requirePermission("fiscal_cofins_cst.read")] },
        controller.listCofinsCst
      );

      app.get(
        "/ipi-cst",
        { preHandler: [requireAuth, requirePermission("fiscal_ipi_cst.read")] },
        controller.listIpiCst
      );
    },
    { prefix: "/fiscal" }
  );
}