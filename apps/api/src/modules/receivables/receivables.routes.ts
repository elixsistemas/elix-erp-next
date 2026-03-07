import type { FastifyInstance } from "fastify";
import * as controller from "./receivables.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireModule } from "@/config/requireModule";

type IdParams = { id: string };

export async function receivablesRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("finance.receivables"));
      app.post<{ Params: IdParams }>(
        "/from-sale/:id",
        {
          preHandler: [
            requireAuth,
            requirePermission("receivables.create"),
          ],
        },
        controller.fromSale
      );

      app.get(
        "/",
        { preHandler: [requireAuth, requirePermission("receivables.read")] },
        controller.list
      );

      app.get<{ Params: IdParams }>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("receivables.read")] },
        controller.get
      );

      app.post<{ Params: IdParams }>(
        "/:id/pay",
        {
          preHandler: [
            requireAuth,
            requirePermission("receivables.update"),
          ],
        },
        controller.pay
      );

      app.post<{ Params: IdParams }>(
        "/:id/cancel",
        {
          preHandler: [
            requireAuth,
            requirePermission("receivables.update"),
          ],
        },
        controller.cancel
      );
    },
    { prefix: "/receivables" }
  );
}