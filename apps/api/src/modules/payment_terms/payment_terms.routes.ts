import type { FastifyInstance } from "fastify";
import * as controller from "./payment_terms.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";

type IdParams = { id: string };

export async function paymentTermsRoutes(app: FastifyInstance) {
  app.get(
    "/payment-terms",
    { preHandler: [requireAuth, requirePermission("payment_terms.read")] },
    controller.list
  );

  app.get<{ Params: IdParams }>(
    "/payment-terms/:id",
    { preHandler: [requireAuth, requirePermission("payment_terms.read")] },
    controller.get
  );

  app.post(
    "/payment-terms",
    { preHandler: [requireAuth, requirePermission("payment_terms.create")] },
    controller.create
  );

  app.patch<{ Params: IdParams }>(
    "/payment-terms/:id",
    { preHandler: [requireAuth, requirePermission("payment_terms.update")] },
    controller.update
  );
}