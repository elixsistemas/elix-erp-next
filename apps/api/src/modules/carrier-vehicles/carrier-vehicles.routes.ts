import type { FastifyInstance } from "fastify";
import * as controller from "./carrier-vehicles.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireModule } from "../../config/requireModule";

export async function carrierVehiclesRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("cadastros.carriers"));

      app.get(
        "/",
        { preHandler: [requireAuth, requirePermission("carrier_vehicles.read")] },
        controller.list,
      );

      app.get(
        "/:id",
        { preHandler: [requireAuth, requirePermission("carrier_vehicles.read")] },
        controller.get,
      );

      app.post(
        "/",
        { preHandler: [requireAuth, requirePermission("carrier_vehicles.create")] },
        controller.create,
      );

      app.patch(
        "/:id",
        { preHandler: [requireAuth, requirePermission("carrier_vehicles.update")] },
        controller.update,
      );

      app.delete(
        "/:id",
        { preHandler: [requireAuth, requirePermission("carrier_vehicles.delete")] },
        controller.remove,
      );
    },
    { prefix: "/carrier-vehicles" },
  );
}