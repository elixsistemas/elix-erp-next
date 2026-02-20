import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../config/prehandlers";
import { list, get, create, update, approve, cancel } from "./quotes.controller";

type IdParams = { id: string };

export async function quotesRoutes(app: FastifyInstance) {
  app.get("/quotes", { preHandler: requireAuth }, list);

  app.get<{ Params: IdParams }>("/quotes/:id", { preHandler: requireAuth }, get);

  app.post("/quotes", { preHandler: requireAuth }, create);

  app.patch<{ Params: IdParams }>("/quotes/:id", { preHandler: requireAuth }, update);

  app.post<{ Params: IdParams }>("/quotes/:id/approve", { preHandler: requireAuth }, approve);
  app.post<{ Params: IdParams }>("/quotes/:id/cancel", { preHandler: requireAuth }, cancel);
}


