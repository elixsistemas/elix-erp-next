import type { FastifyInstance } from "fastify";
import * as controller from "./bank_balance_events.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";

export async function bankBalanceEventsRoutes(app: FastifyInstance) {
  app.get(
    "/bank-balance-events",
    { preHandler: [requireAuth, requirePermission("reconciliation.read")] },
    controller.list
  );

  app.post(
    "/bank-balance-events",
    { preHandler: [requireAuth, requirePermission("reconciliation.update")] },
    controller.create
  );

  app.delete(
    "/bank-balance-events/:id",
    { preHandler: [requireAuth, requirePermission("reconciliation.update")] },
    controller.remove
  );
}