import type { FastifyInstance } from "fastify";
import * as controller from "./companies.controller";
import { requireAuth } from "../../config/prehandlers";

export async function companiesRoutes(app: FastifyInstance) {
  app.get("/companies", { preHandler: requireAuth }, controller.list);
  app.get("/companies/:id", { preHandler: requireAuth }, controller.get);
  app.post("/companies", { preHandler: requireAuth }, controller.create);
  app.patch("/companies/:id", { preHandler: requireAuth }, controller.update);
  app.delete("/companies/:id", { preHandler: requireAuth }, controller.remove);
}
