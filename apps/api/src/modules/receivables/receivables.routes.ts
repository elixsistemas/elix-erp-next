import type { FastifyInstance } from "fastify";
import * as controller from "./receivables.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";

type IdParams = { id: string };

export async function receivablesRoutes(app: FastifyInstance) {
  app.post<{ Params: IdParams }>(
    "/receivables/from-sale/:id",
    {
      preHandler: [
        requireAuth,
        requirePermission("receivables.create"),
      ],
    },
    controller.fromSale
  );

  app.get(
    "/receivables",
    { preHandler: [requireAuth, requirePermission("receivables.read")] },
    controller.list
  );

  app.get<{ Params: IdParams }>(
    "/receivables/:id",
    { preHandler: [requireAuth, requirePermission("receivables.read")] },
    controller.get
  );

  app.post<{ Params: IdParams }>(
    "/receivables/:id/pay",
    {
      preHandler: [
        requireAuth,
        requirePermission("receivables.update"),
      ],
    },
    controller.pay
  );

  app.post<{ Params: IdParams }>(
    "/receivables/:id/cancel",
    {
      preHandler: [
        requireAuth,
        requirePermission("receivables.update"),
      ],
    },
    controller.cancel
  );
}