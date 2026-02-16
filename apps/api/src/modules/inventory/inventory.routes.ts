import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../config/prehandlers";
import * as controller from "./inventory.controller";

export async function inventoryRoutes(app: FastifyInstance) {
  app.get("/inventory", { preHandler: requireAuth }, controller.listStock);
  app.get("/inventory/stock", { preHandler: requireAuth }, controller.stock);
}
