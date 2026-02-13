import type { FastifyInstance } from "fastify";
import * as controller from "./customers.controller";
import { requireAuth } from "../../config/prehandlers";

export async function customersRoutes(app: FastifyInstance) {
  app.get("/customers", { preHandler: requireAuth }, controller.list);
  app.post("/customers", { preHandler: requireAuth }, controller.create);
  app.patch("/customers/:id", { preHandler: requireAuth }, controller.update);
  app.delete("/customers/:id", { preHandler: requireAuth }, controller.remove);
}
