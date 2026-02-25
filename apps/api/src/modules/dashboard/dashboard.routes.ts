import type { FastifyInstance } from "fastify";
import * as controller from "./dashboard.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";

export async function dashboardRoutes(app: FastifyInstance) {
  app.get(
    "/dashboard/finance/summary",
    { preHandler: [requireAuth, requirePermission("cashflow.read")] },
    controller.financeSummary
  );
}