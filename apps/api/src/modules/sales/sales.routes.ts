import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../config/prehandlers";
import * as controller from "./sales.controller";

type IdParams = { id: string };

export async function salesRoutes(app: FastifyInstance) {
  app.get("/sales", { preHandler: requireAuth }, controller.list);

  app.get<{ Params: IdParams }>(
    "/sales/:id",
    { preHandler: requireAuth },
    controller.get
  );

  app.post<{ Params: IdParams }>(
    "/sales/from-quote/:id",
    { preHandler: requireAuth },
    controller.fromQuote
  );

  app.post<{ Params: IdParams }>(
    "/sales/:id/cancel",
    { preHandler: requireAuth },
    controller.cancel
  );

  app.patch<{ Params: IdParams }>(
    "/sales/:id",
    { preHandler: requireAuth },
    controller.update
  );
}
