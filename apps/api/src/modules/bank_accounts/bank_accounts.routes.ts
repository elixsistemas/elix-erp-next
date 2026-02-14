import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../config/prehandlers";
import * as controller from "./bank_accounts.controller";

type IdParams = { id: string };

export async function bankAccountsRoutes(app: FastifyInstance) {
  app.get("/bank-accounts", { preHandler: requireAuth }, controller.list);
  app.get<{ Params: IdParams }>("/bank-accounts/:id", { preHandler: requireAuth }, controller.get);

  app.post("/bank-accounts", { preHandler: requireAuth }, controller.create);
  app.patch<{ Params: IdParams }>("/bank-accounts/:id", { preHandler: requireAuth }, controller.update);

  app.delete<{ Params: IdParams }>("/bank-accounts/:id", { preHandler: requireAuth }, controller.remove);
}
