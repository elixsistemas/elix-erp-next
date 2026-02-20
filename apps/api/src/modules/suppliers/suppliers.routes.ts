import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../config/prehandlers";
import * as controller from "./suppliers.controller";

export async function suppliersRoutes(app: FastifyInstance) {
  app.get("/suppliers", { preHandler: requireAuth }, controller.list);
  app.get("/suppliers/:id", { preHandler: requireAuth }, controller.get);
  app.post("/suppliers", { preHandler: requireAuth }, controller.create);
  app.patch("/suppliers/:id", { preHandler: requireAuth }, controller.update);
  app.delete("/suppliers/:id", { preHandler: requireAuth }, controller.remove);
}
