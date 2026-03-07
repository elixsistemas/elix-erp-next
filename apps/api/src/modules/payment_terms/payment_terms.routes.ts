import type { FastifyInstance } from "fastify";
import * as controller from "./payment_terms.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireModule } from "@/config/requireModule";

type IdParams = { id: string };

export async function paymentTermsRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("cadastros.payment_terms"));
      app.get(
        "/",
        { preHandler: [requireAuth, requirePermission("payment_terms.read")] },
        controller.list
      );

      app.get<{ Params: IdParams }>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("payment_terms.read")] },
        controller.get
      );

      app.post(
        "/",
        { preHandler: [requireAuth, requirePermission("payment_terms.create")] },
        controller.create
      );

      app.patch<{ Params: IdParams }>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("payment_terms.update")] },
        controller.update
      );
      },
    { prefix: "/payment-terms" }
 );
}