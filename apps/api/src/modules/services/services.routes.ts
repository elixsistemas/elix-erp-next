import type { FastifyInstance } from "fastify";

import * as controller from "./services.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireModule } from "../../config/requireModule";

type IdParams = {
  Params: { id: string };
};

export async function servicesRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("cadastros.services"));

      app.get(
        "/",
        {
          preHandler: [requireAuth, requirePermission("services.read")],
        },
        controller.list,
      );

      app.get<IdParams>(
        "/:id",
        {
          preHandler: [requireAuth, requirePermission("services.read")],
        },
        controller.get,
      );

      app.post(
        "/",
        {
          preHandler: [requireAuth, requirePermission("services.create")],
        },
        controller.create,
      );

      app.patch<IdParams>(
        "/:id",
        {
          preHandler: [requireAuth, requirePermission("services.update")],
        },
        controller.update,
      );

      app.delete<IdParams>(
        "/:id",
        {
          preHandler: [requireAuth, requirePermission("services.delete")],
        },
        controller.remove,
      );
    },
    { prefix: "/services" },
  );
}