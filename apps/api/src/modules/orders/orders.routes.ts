import type { FastifyInstance } from "fastify";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { list, get, create, update, confirm, cancel, createFromQuote } from "./orders.controller";
import { requireModule } from "../../config/requireModule";

type IdParams = { id: string };

export async function ordersRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("commercial.orders"));
        app.get(
          "/",
          { preHandler: [requireAuth, requirePermission("orders.read")] },
          list
        );

        app.get<{ Params: IdParams }>(
          "/:id",
          { preHandler: [requireAuth, requirePermission("orders.read")] },
          get
        );

        app.post(
          "/",
          { preHandler: [requireAuth, requirePermission("orders.create")] },
          create
        );

        app.patch<{ Params: IdParams }>(
          "/:id",
          { preHandler: [requireAuth, requirePermission("orders.update")] },
          update
        );

        app.post<{ Params: IdParams }>(
          "/:id/confirm",
          { preHandler: [requireAuth, requirePermission("orders.confirm")] },
          confirm
        );

        app.post<{ Params: IdParams }>(
          "/:id/cancel",
          { preHandler: [requireAuth, requirePermission("orders.cancel")] },
          cancel
        );

        app.post<{ Params: IdParams }>(
          "/from-quote/:id",
          { preHandler: [requireAuth, requirePermission("orders.create")] },
          createFromQuote
        );
      },
    { prefix: "/orders" }
 );
}