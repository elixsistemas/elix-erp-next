import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../config/prehandlers";
import * as controller from "./payment_terms.controller";

type IdParams = { id: string };

export async function paymentTermsRoutes(app: FastifyInstance) {
  app.get("/payment-terms", { preHandler: requireAuth }, controller.list);

  app.get<{ Params: IdParams }>(
    "/payment-terms/:id",
    { preHandler: requireAuth },
    controller.get
  );

  app.post("/payment-terms", { preHandler: requireAuth }, controller.create);

  app.patch<{ Params: IdParams }>(
    "/payment-terms/:id",
    { preHandler: requireAuth },
    controller.update
  );
}