import type { FastifyInstance } from "fastify";
import * as controller from "./cost-centers.controller";
import { requireAuth, requirePermission } from "@/config/prehandlers";
import { requireModule } from "@/config/requireModule";

type IdParams = {
  Params: { id: string };
};

export async function costCentersRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("finance.cost_centers"));

      app.get(
        "/",
        { preHandler: [requireAuth, requirePermission("cost_centers.read")] },
        controller.list,
      );

      app.get<IdParams>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("cost_centers.read")] },
        controller.get,
      );

      app.post(
        "/",
        { preHandler: [requireAuth, requirePermission("cost_centers.create")] },
        controller.create,
      );

      app.patch<IdParams>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("cost_centers.update")] },
        controller.update,
      );

      app.delete<IdParams>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("cost_centers.delete")] },
        controller.remove,
      );
    },
    { prefix: "/cost-centers" },
  );
}