import type { FastifyInstance } from "fastify";
import * as controller from "./inventory.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireModule } from "../../config/requireModule";

export async function inventoryRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("inventory.stock"));

      app.get(
        "/",
        {
          preHandler: [requireAuth, requirePermission("inventory.read")],
        },
        controller.listStock,
      );

      app.get(
        "/stock",
        {
          preHandler: [requireAuth, requirePermission("inventory.read")],
        },
        controller.stock,
      );
    },
    { prefix: "/inventory" },
  );
}