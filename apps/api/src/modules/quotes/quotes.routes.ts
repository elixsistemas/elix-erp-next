import type { FastifyInstance } from "fastify";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { list, get, create, update, approve, cancel } from "./quotes.controller";

type IdParams = { id: string };

export async function quotesRoutes(app: FastifyInstance) {
  app.get(
    "/quotes",
    { preHandler: [requireAuth, requirePermission("quotes.read")] },
    list
  );

  app.get<{ Params: IdParams }>(
    "/quotes/:id",
    { preHandler: [requireAuth, requirePermission("quotes.read")] },
    get
  );

  app.post(
    "/quotes",
    { preHandler: [requireAuth, requirePermission("quotes.create")] },
    create
  );

  app.patch<{ Params: IdParams }>(
    "/quotes/:id",
    { preHandler: [requireAuth, requirePermission("quotes.update")] },
    update
  );

  app.post<{ Params: IdParams }>(
    "/quotes/:id/approve",
    { preHandler: [requireAuth, requirePermission("quotes.approve")] },
    approve
  );

  app.post<{ Params: IdParams }>(
    "/quotes/:id/cancel",
    { preHandler: [requireAuth, requirePermission("quotes.cancel")] },
    cancel
  );
}