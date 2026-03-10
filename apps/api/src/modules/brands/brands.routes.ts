import type { FastifyInstance } from "fastify";
import * as controller from "./brands.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireModule } from "../../config/requireModule";

type IdParams = {
  Params: { id: string };
};

export async function brandsRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("cadastros.brands"));

      app.get(
        "/",
        { preHandler: [requireAuth, requirePermission("brands.read")] },
        controller.list,
      );

      app.get<IdParams>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("brands.read")] },
        controller.get,
      );

      app.post(
        "/",
        { preHandler: [requireAuth, requirePermission("brands.create")] },
        controller.create,
      );

      app.patch<IdParams>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("brands.update")] },
        controller.update,
      );

      app.delete<IdParams>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("brands.delete")] },
        controller.remove,
      );
    },
    { prefix: "/brands" },
  );
}