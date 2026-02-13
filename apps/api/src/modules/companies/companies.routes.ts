import type { FastifyInstance } from "fastify";
import * as controller from "./companies.controller";

export async function companiesRoutes(app: FastifyInstance) {
  app.get("/companies", controller.list);
  app.get("/companies/:id", controller.get);
  app.post("/companies", controller.create);
  app.patch("/companies/:id", controller.update);
  app.delete("/companies/:id", controller.remove);
}
