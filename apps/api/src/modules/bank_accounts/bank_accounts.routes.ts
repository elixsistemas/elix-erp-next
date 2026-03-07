import type { FastifyInstance } from "fastify";
import * as controller from "./bank_accounts.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireModule } from "../../config/requireModule";

type IdParams = { id: string };

export async function bankAccountsRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("cadastros.bank_accounts"));
      app.get(
        "/",
        { preHandler: [requireAuth, requirePermission("bank_accounts.read")] },
        controller.list
      );

      app.post(
        "/",
        { preHandler: [requireAuth, requirePermission("bank_accounts.create")] },
        controller.create
      );

      app.patch(
        "/:id",
        { preHandler: [requireAuth, requirePermission("bank_accounts.update")] },
        controller.update
      );

      app.delete(
        "/:id",
        { preHandler: [requireAuth, requirePermission("bank_accounts.delete")] },
        controller.desativar
      );

      app.patch(
        "/:id/activate",
        { preHandler: [requireAuth, requirePermission("bank_accounts.update")] },
        controller.activate
      );
    },
    { prefix: "/bank-accounts" }
  );
}