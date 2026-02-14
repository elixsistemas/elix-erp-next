import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../config/prehandlers";
import * as controller from "./quotes.controller";

type IdParams = { id: string };

export async function quotesRoutes(app: FastifyInstance) {
  app.get("/quotes", { preHandler: requireAuth }, controller.list);

  app.get<{ Params: IdParams }>(
    "/quotes/:id",
    { preHandler: requireAuth },
    controller.get
  );

  app.post("/quotes", { preHandler: requireAuth }, controller.create);

  app.patch<{ Params: IdParams }>(
    "/quotes/:id",
    { preHandler: requireAuth },
    controller.update
  );
}
