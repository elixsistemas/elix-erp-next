import type { FastifyInstance } from "fastify";
import * as controller from "./fiscal.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";

export async function fiscalRoutes(app: FastifyInstance) {
  app.post<{ Params: { id: number } }>(
    "/fiscal/:id/emit",
    { preHandler: [requireAuth, requirePermission("nfe.read")] },
    controller.emit
  );

  app.post<{ Params: { id: number } }>(
    "/fiscal/:id/cancel",
    { preHandler: [requireAuth, requirePermission("nfe.read")] },
    controller.cancel
  );
}