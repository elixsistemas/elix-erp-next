import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../config/prehandlers";
import * as controller from "./receivables.controller";

type IdParams = { id: string };

export async function receivablesRoutes(app: FastifyInstance) {
  app.post<{ Params: IdParams }>(
    "/receivables/from-sale/:id",
    { preHandler: requireAuth },
    controller.fromSale
  );

  app.get(
    "/receivables",
    { preHandler: requireAuth },
    controller.list
  );

  app.get<{ Params: IdParams }>(
    "/receivables/:id",
    { preHandler: requireAuth },
    controller.get
  );

  app.post<{ Params: IdParams }>(
    "/receivables/:id/pay",
    { preHandler: requireAuth },
    controller.pay
  );

  app.post<{ Params: IdParams }>(
    "/receivables/:id/cancel",
    { preHandler: requireAuth },
    controller.cancel
  );
}
