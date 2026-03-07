import type { FastifyInstance } from "fastify";
import * as controller from "./suppliers.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireModule } from "@/config/requireModule";

export async function suppliersRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("cadastros.suppliers"));
      app.get(
        "/",
        { preHandler: [requireAuth, requirePermission("suppliers.read")] },
        controller.list
      );

      app.get(
        "/:id",
        { preHandler: [requireAuth, requirePermission("suppliers.read")] },
        controller.get
      );

      app.post(
        "/",
        { preHandler: [requireAuth, requirePermission("suppliers.create")] },
        controller.create
      );

      app.patch(
        "/:id",
        { preHandler: [requireAuth, requirePermission("suppliers.update")] },
        controller.update
      );

      app.delete(
        "/:id",
        { preHandler: [requireAuth, requirePermission("suppliers.delete")] },
        controller.remove
      );
    },
    { prefix: "/suppliers" }
  );
}