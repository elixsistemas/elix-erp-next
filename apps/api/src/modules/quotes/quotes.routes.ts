import type { FastifyInstance } from "fastify";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { list, get, create, update, approve, cancel } from "./quotes.controller";
import { requireModule } from "@/config/requireModule";

type IdParams = { id: string };

export async function quotesRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("commercial.quotes"));
      app.get(
        "/",
        { preHandler: [requireAuth, requirePermission("quotes.read")] },
        list
      );

      app.get<{ Params: IdParams }>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("quotes.read")] },
        get
      );

      app.post(
        "/",
        { preHandler: [requireAuth, requirePermission("quotes.create")] },
        create
      );

      app.patch<{ Params: IdParams }>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("quotes.update")] },
        update
      );

      app.post<{ Params: IdParams }>(
        "/:id/approve",
        { preHandler: [requireAuth, requirePermission("quotes.approve")] },
        approve
      );

      app.post<{ Params: IdParams }>(
        "/:id/cancel",
        { preHandler: [requireAuth, requirePermission("quotes.cancel")] },
        cancel
      );
    },
    { prefix: "/quotes" }
  );
}