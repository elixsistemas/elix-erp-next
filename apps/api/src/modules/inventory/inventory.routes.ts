import type { FastifyInstance } from "fastify";
import * as controller from "./inventory.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";

export async function inventoryRoutes(app: FastifyInstance) {
  app.get(
    "/inventory",
    { preHandler: [requireAuth, requirePermission("inventory.read")] },
    controller.listStock
  );

  app.get(
    "/inventory/stock",
    { preHandler: [requireAuth, requirePermission("inventory.read")] },
    controller.stock
  );
}