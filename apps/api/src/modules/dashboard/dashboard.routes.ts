import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../config/prehandlers";
import * as controller from "./dashboard.controller";

export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/dashboard/finance/summary", { preHandler: requireAuth }, controller.financeSummary);
}
