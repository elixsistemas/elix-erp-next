import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../config/prehandlers";
import * as controller from "./fiscal.controller";

export async function fiscalRoutes(app: FastifyInstance) {
  app.post<{ Params: { id: number } }>(
    "/fiscal/:id/emit",
    { preHandler: requireAuth },
    controller.emit
  );

  app.post<{ Params: { id: number } }>(
    "/fiscal/:id/cancel",
    { preHandler: requireAuth },
    controller.cancel
  );
}
