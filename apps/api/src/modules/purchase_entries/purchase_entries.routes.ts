import type { FastifyInstance } from "fastify";
import * as controller from "./purchase_entries.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireModule } from "../../config/requireModule";

export async function purchaseEntriesRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("commercial.purchase_entries"));

      app.get(
        "/financial-options",
        {
          preHandler: [requireAuth, requirePermission("purchase_entries.read")],
        },
        controller.getFinancialOptions,
      );

      app.get(
        "/",
        {
          preHandler: [requireAuth, requirePermission("purchase_entries.read")],
        },
        controller.listImports,
      );

      app.get(
        "/:id",
        {
          preHandler: [requireAuth, requirePermission("purchase_entries.read")],
        },
        controller.getImportById,
      );

      app.post(
        "/import-xml",
        {
          preHandler: [requireAuth, requirePermission("purchase_entries.import")],
        },
        controller.importXml,
      );

      app.put(
        "/:id/financial",
        {
          preHandler: [requireAuth, requirePermission("purchase_entries.update")],
        },
        controller.updateImportFinancial,
      );

      app.put(
        "/:id/logistics",
        {
          preHandler: [requireAuth, requirePermission("purchase_entries.update")],
        },
        controller.updateImportLogistics,
      );

      app.put(
        "/:id/match-supplier",
        {
          preHandler: [requireAuth, requirePermission("purchase_entries.update")],
        },
        controller.matchSupplier,
      );

      app.post(
        "/:id/create-supplier",
        {
          preHandler: [requireAuth, requirePermission("purchase_entries.update")],
        },
        controller.createSupplierFromImport,
      );

      app.put(
        "/:id/items/:itemId",
        {
          preHandler: [requireAuth, requirePermission("purchase_entries.update")],
        },
        controller.updateImportItem,
      );

      app.put(
        "/:id/items/:itemId/match-product",
        {
          preHandler: [requireAuth, requirePermission("purchase_entries.update")],
        },
        controller.matchProduct,
      );

      app.post(
        "/:id/items/:itemId/create-product",
        {
          preHandler: [requireAuth, requirePermission("purchase_entries.update")],
        },
        controller.createProductFromImportItem,
      );

      app.put(
        "/:id/installments/:installmentId",
        {
          preHandler: [requireAuth, requirePermission("purchase_entries.update")],
        },
        controller.updateImportInstallment,
      );

      app.post(
        "/:id/confirm",
        {
          preHandler: [requireAuth, requirePermission("purchase_entries.confirm")],
        },
        controller.confirmImport,
      );

      app.patch(
        "/:id/cancel",
        {
          preHandler: [requireAuth, requirePermission("purchase_entries.update")],
        },
        controller.cancelImport,
      );

      app.get(
        "/suppliers-mini",
        {
          preHandler: [requireAuth, requirePermission("purchase_entries.read")],
        },
        controller.listSuppliersMini,
      );

      app.get(
        "/products-mini",
        {
          preHandler: [requireAuth, requirePermission("purchase_entries.read")],
        },
        controller.listProductsMini,
      );

    },
    { prefix: "/purchase-entry-imports" },
  );
}