import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../config/prehandlers";
import * as controller from "./inventory.controller";

export async function inventoryRoutes(app: FastifyInstance) {
  app.get("/inventory/movements", { preHandler: requireAuth }, controller.list);
  app.post("/inventory/movements", { preHandler: requireAuth }, controller.create);
}
