import type { FastifyInstance } from "fastify";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { list, get, create, update, confirm, cancel, createFromQuote } from "./orders.controller";

type IdParams = { id: string };

export async function ordersRoutes(app: FastifyInstance) {
  app.get(
    "/orders",
    { preHandler: [requireAuth, requirePermission("orders.read")] },
    list
  );

  app.get<{ Params: IdParams }>(
    "/orders/:id",
    { preHandler: [requireAuth, requirePermission("orders.read")] },
    get
  );

  app.post(
    "/orders",
    { preHandler: [requireAuth, requirePermission("orders.create")] },
    create
  );

  app.patch<{ Params: IdParams }>(
    "/orders/:id",
    { preHandler: [requireAuth, requirePermission("orders.update")] },
    update
  );

  app.post<{ Params: IdParams }>(
    "/orders/:id/confirm",
    { preHandler: [requireAuth, requirePermission("orders.confirm")] },
    confirm
  );

  app.post<{ Params: IdParams }>(
    "/orders/:id/cancel",
    { preHandler: [requireAuth, requirePermission("orders.cancel")] },
    cancel
  );

  app.post<{ Params: IdParams }>(
    "/orders/from-quote/:id",
    { preHandler: [requireAuth, requirePermission("orders.create")] }, // conversão cria pedido
    createFromQuote
  );
}