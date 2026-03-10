import type { FastifyInstance } from "fastify";
import * as controller from "./product-kits.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireModule } from "../../config/requireModule";

type IdParams = {
  Params: { id: string };
};

export async function productKitsRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("cadastros.product_kits"));

      app.get(
        "/",
        { preHandler: [requireAuth, requirePermission("product_kits.read")] },
        controller.list,
      );

      app.get<IdParams>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("product_kits.read")] },
        controller.get,
      );

      app.put(
        "/",
        { preHandler: [requireAuth, requirePermission("product_kits.update")] },
        controller.upsert,
      );
    },
    { prefix: "/product-kits" },
  );
}