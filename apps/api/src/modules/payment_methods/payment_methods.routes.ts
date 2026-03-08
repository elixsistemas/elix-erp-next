import type { FastifyInstance } from "fastify";
import * as controller from "./payment_methods.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireModule } from "../../config/requireModule";

type IdParams = { id: string };

export async function paymentMethodsRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("cadastros.payment_methods"));

      app.get(
        "/",
        { preHandler: [requireAuth, requirePermission("payment_methods.read")] },
        controller.list,
      );

      app.get<{ Params: IdParams }>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("payment_methods.read")] },
        controller.get,
      );

      app.post(
        "/",
        { preHandler: [requireAuth, requirePermission("payment_methods.create")] },
        controller.create,
      );

      app.patch<{ Params: IdParams }>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("payment_methods.update")] },
        controller.update,
      );

      app.delete<{ Params: IdParams }>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("payment_methods.delete")] },
        controller.desativar,
      );

      app.patch<{ Params: IdParams }>(
        "/:id/activate",
        { preHandler: [requireAuth, requirePermission("payment_methods.update")] },
        controller.activate,
      );
    },
    { prefix: "/payment-methods" },
  );
}