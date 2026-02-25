import type { FastifyInstance } from "fastify";
import * as controller from "./bank_accounts.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";

export async function bankAccountsRoutes(app: FastifyInstance) {
  app.get(
    "/bank-accounts",
    { preHandler: [requireAuth, requirePermission("bank_accounts.read")] },
    controller.list
  );

  app.post(
    "/bank-accounts",
    { preHandler: [requireAuth, requirePermission("bank_accounts.create")] },
    controller.create
  );

  app.patch(
    "/bank-accounts/:id",
    { preHandler: [requireAuth, requirePermission("bank_accounts.update")] },
    controller.update
  );

  app.delete(
    "/bank-accounts/:id",
    { preHandler: [requireAuth, requirePermission("bank_accounts.delete")] },
    controller.desativar
  );

  app.patch(
    "/bank-accounts/:id/activate",
    { preHandler: [requireAuth, requirePermission("bank_accounts.update")] },
    controller.activate
  );
}