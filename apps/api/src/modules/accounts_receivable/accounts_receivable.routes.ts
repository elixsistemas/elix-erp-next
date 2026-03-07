import type { FastifyInstance } from "fastify";
import * as controller from "./accounts_receivable.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireModule } from "../../config/requireModule";

type IdParams = { id: string };

export async function accountsReceivableRoutes(app: FastifyInstance) {
    app.register(
      async function (app) {
        app.addHook("preHandler", requireModule("finance.receivables"));
        app.get(
          "/",
          { preHandler: [requireAuth, requirePermission("receivables.read")] },
          controller.list
        );

        app.get<{ Params: IdParams }>(
          "/by-sale/:id",
          { preHandler: [requireAuth, requirePermission("receivables.read")] },
          controller.getBySale
        );

        app.patch<{ Params: IdParams }>(
          "/:id",
          { preHandler: [requireAuth, requirePermission("receivables.update")] },
          controller.update
        );

        app.post<{ Params: IdParams }>(
          "/:id/cancel",
          { preHandler: [requireAuth, requirePermission("receivables.update")] },
          controller.cancel
        );

        app.post<{ Params: IdParams }>(
          "/from-sale/:id",
          { preHandler: [requireAuth, requirePermission("receivables.create")] },
          controller.fromSale
        );

        app.post<{ Params: IdParams }>(
          "/:id/issue",
          { preHandler: [requireAuth, requirePermission("receivables.update")] },
          controller.issueMock
        );
      },
      { prefix: "/receivables" }
    );
}