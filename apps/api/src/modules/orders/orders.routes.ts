import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../config/prehandlers";
import * as controller from "./orders.controller";

type IdParams = { id: string };

export async function ordersRoutes(app: FastifyInstance) {
  app.get("/orders", { preHandler: requireAuth }, controller.list);

  app.get<{ Params: IdParams }>(
    "/orders/:id",
    { preHandler: requireAuth },
    controller.get
  );

  app.post("/orders", { preHandler: requireAuth }, controller.create);

  app.patch<{ Params: IdParams }>(
    "/orders/:id",
    { preHandler: requireAuth },
    controller.update
  );

  app.post<{ Params: IdParams }>(
    "/orders/:id/cancel",
    { preHandler: requireAuth },
    controller.cancel
  );

  // ✅ Marcha 1: Faturar pedido -> gera SALE (sem nota)
  app.post<{ Params: IdParams }>(
    "/orders/:id/bill",
    { preHandler: requireAuth },
    controller.bill
  );
}
