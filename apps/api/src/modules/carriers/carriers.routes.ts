import type { FastifyInstance } from "fastify";
import * as controller from "./carriers.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireModule } from "../../config/requireModule";

export async function carriersRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("cadastros.carriers"));

      app.get(
        "/",
        { preHandler: [requireAuth, requirePermission("carriers.read")] },
        controller.list,
      );

      app.get(
        "/:id",
        { preHandler: [requireAuth, requirePermission("carriers.read")] },
        controller.get,
      );

      app.post(
        "/",
        { preHandler: [requireAuth, requirePermission("carriers.create")] },
        controller.create,
      );

      app.patch(
        "/:id",
        { preHandler: [requireAuth, requirePermission("carriers.update")] },
        controller.update,
      );

      app.delete(
        "/:id",
        { preHandler: [requireAuth, requirePermission("carriers.delete")] },
        controller.remove,
      );
    },
    { prefix: "/carriers" },
  );
}