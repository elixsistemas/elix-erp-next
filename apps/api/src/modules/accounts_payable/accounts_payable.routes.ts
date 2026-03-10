import type { FastifyInstance } from "fastify";
import * as controller from "./accounts_payable.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireModule } from "../../config/requireModule";

export async function accountsPayableRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("finance.payables"));

      app.get(
        "/",
        {
          preHandler: [requireAuth, requirePermission("payables.read")],
        },
        controller.listAccountsPayable,
      );

      app.get(
        "/:id",
        {
          preHandler: [requireAuth, requirePermission("payables.read")],
        },
        controller.getAccountsPayableById,
      );

      app.post(
        "/",
        {
          preHandler: [requireAuth, requirePermission("payables.create")],
        },
        controller.createAccountsPayable,
      );

      app.put(
        "/:id",
        {
          preHandler: [requireAuth, requirePermission("payables.update")],
        },
        controller.updateAccountsPayable,
      );

      app.patch(
        "/:id/status",
        {
          preHandler: [requireAuth, requirePermission("payables.update")],
        },
        controller.updateAccountsPayableStatus,
      );
    },
    { prefix: "/accounts-payable" },
  );
}