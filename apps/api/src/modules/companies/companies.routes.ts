import type { FastifyInstance } from "fastify";
import * as controller from "./companies.controller";
import { requireAuth } from "../../config/prehandlers";

export async function companiesRoutes(app: FastifyInstance) {
  app.get("/companies", { preHandler: requireAuth }, controller.list);
  app.get("/companies/me", { preHandler: requireAuth }, controller.get);
  app.patch("/companies/me", { preHandler: requireAuth }, controller.update);

  // admin only (controller já bloqueia)
  app.post("/companies", { preHandler: requireAuth }, controller.create);
  app.delete("/companies/:id", { preHandler: requireAuth }, controller.remove);
}
