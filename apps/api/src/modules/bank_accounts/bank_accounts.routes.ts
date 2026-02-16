import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../config/prehandlers";
import * as controller from "./bank_accounts.controller";

export async function bankAccountsRoutes(app: FastifyInstance) {
  app.get("/bank-accounts", { preHandler: requireAuth }, controller.list);
  app.post("/bank-accounts", { preHandler: requireAuth }, controller.create);
  app.patch("/bank-accounts/:id", { preHandler: requireAuth }, controller.update);
  app.delete("/bank-accounts/:id", { preHandler: requireAuth }, controller.desativar);
  app.patch("/bank-accounts/:id/activate", { preHandler: requireAuth }, controller.activate);
}
