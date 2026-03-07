import type { FastifyInstance } from "fastify";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import {
  list, get, create, update,
  complete, cancel,
  createFromQuote, createFromOrder
} from "./sales.controller";
import { requireModule } from "../../config/requireModule";

type IdParams = { id: string };

export async function salesRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("commercial.sales"));
      app.get(
        "/",
        { preHandler: [requireAuth, requirePermission("sales.read")] },
        list
      );

      app.get<{ Params: IdParams }>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("sales.read")] },
        get
      );

      app.post(
        "/",
        { preHandler: [requireAuth, requirePermission("sales.create")] },
        create
      );

      app.patch<{ Params: IdParams }>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("sales.update")] },
        update
      );

      app.post<{ Params: IdParams }>(
        "/:id/complete",
        { preHandler: [requireAuth, requirePermission("sales.complete")] }, 
        complete
      );

      app.post<{ Params: IdParams }>(
        "/:id/cancel",
        { preHandler: [requireAuth, requirePermission("sales.cancel")] },
        cancel
      );

      app.post<{ Params: IdParams }>(
        "/from-quote/:id",
        { preHandler: [requireAuth, requirePermission("sales.create")] },
        createFromQuote
      );

      app.post<{ Params: IdParams }>(
        "/from-order/:id",
        { preHandler: [requireAuth, requirePermission("sales.create")] },
        createFromOrder
      );
    },
    { prefix: "/sales" }
  );
}