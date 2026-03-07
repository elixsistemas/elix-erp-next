import type { FastifyInstance } from "fastify";
import * as controller from "./dashboard.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireModule } from "@/config/requireModule";

export async function dashboardRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("core.dashboard"));
      app.get(
        "/finance/summary",
        { preHandler: [requireAuth, requirePermission("cashflow.read")] },
        controller.financeSummary
      );
    },
    { prefix: "/dashboard" }
  );
}