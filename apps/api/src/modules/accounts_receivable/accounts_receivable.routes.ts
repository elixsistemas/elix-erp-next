import type { FastifyInstance } from "fastify";
import * as controller from "./accounts_receivable.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";

type IdParams = { id: string };

export async function accountsReceivableRoutes(app: FastifyInstance) {
  app.get(
    "/receivables",
    { preHandler: [requireAuth, requirePermission("receivables.read")] },
    controller.list
  );

  app.get<{ Params: IdParams }>(
    "/receivables/by-sale/:id",
    { preHandler: [requireAuth, requirePermission("receivables.read")] },
    controller.getBySale
  );

  app.patch<{ Params: IdParams }>(
    "/receivables/:id",
    { preHandler: [requireAuth, requirePermission("receivables.update")] },
    controller.update
  );

  app.post<{ Params: IdParams }>(
    "/receivables/:id/cancel",
    { preHandler: [requireAuth, requirePermission("receivables.update")] },
    controller.cancel
  );

  app.post<{ Params: IdParams }>(
    "/receivables/from-sale/:id",
    { preHandler: [requireAuth, requirePermission("receivables.create")] },
    controller.fromSale
  );

  app.post<{ Params: IdParams }>(
    "/receivables/:id/issue",
    { preHandler: [requireAuth, requirePermission("receivables.update")] },
    controller.issueMock
  );
}