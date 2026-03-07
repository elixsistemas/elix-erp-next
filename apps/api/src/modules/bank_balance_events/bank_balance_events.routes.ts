import type { FastifyInstance } from "fastify";
import * as controller from "./bank_balance_events.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireModule } from "../../config/requireModule";


export async function bankBalanceEventsRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("finance.reconciliation"));
      app.get(
        "/",
        { preHandler: [requireAuth, requirePermission("reconciliation.read")] },
        controller.list
      );

      app.post(
        "/",
        { preHandler: [requireAuth, requirePermission("reconciliation.update")] },
        controller.create
      );

      app.delete(
        "/:id",
        { preHandler: [requireAuth, requirePermission("reconciliation.update")] },
        controller.remove
      );
    },
    { prefix: "/bank-balance-events" }
  );
}