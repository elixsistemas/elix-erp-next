import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../config/prehandlers";
import * as controller from "./bank_balance_events.controller";

export async function bankBalanceEventsRoutes(app: FastifyInstance) {
  app.get("/bank-balance-events", { preHandler: requireAuth }, controller.list);
  app.post("/bank-balance-events", { preHandler: requireAuth }, controller.create);
  app.delete("/bank-balance-events/:id", { preHandler: requireAuth }, controller.remove);
}
