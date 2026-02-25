import type { FastifyInstance } from "fastify";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import {
  list, get, create, update,
  complete, cancel,
  createFromQuote, createFromOrder
} from "./sales.controller";

type IdParams = { id: string };

export async function salesRoutes(app: FastifyInstance) {
  app.get(
    "/sales",
    { preHandler: [requireAuth, requirePermission("sales.read")] },
    list
  );

  app.get<{ Params: IdParams }>(
    "/sales/:id",
    { preHandler: [requireAuth, requirePermission("sales.read")] },
    get
  );

  app.post(
    "/sales",
    { preHandler: [requireAuth, requirePermission("sales.create")] },
    create
  );

  app.patch<{ Params: IdParams }>(
    "/sales/:id",
    { preHandler: [requireAuth, requirePermission("sales.update")] },
    update
  );

  app.post<{ Params: IdParams }>(
    "/sales/:id/complete",
    { preHandler: [requireAuth, requirePermission("sales.complete")] }, 
    complete
  );

  app.post<{ Params: IdParams }>(
    "/sales/:id/cancel",
    { preHandler: [requireAuth, requirePermission("sales.cancel")] },
    cancel
  );

  app.post<{ Params: IdParams }>(
    "/sales/from-quote/:id",
    { preHandler: [requireAuth, requirePermission("sales.create")] },
    createFromQuote
  );

  app.post<{ Params: IdParams }>(
    "/sales/from-order/:id",
    { preHandler: [requireAuth, requirePermission("sales.create")] },
    createFromOrder
  );
}