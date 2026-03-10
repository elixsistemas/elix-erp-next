import type { FastifyInstance } from "fastify";
import * as controller from "./product-categories.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireModule } from "../../config/requireModule";

type IdParams = {
  Params: { id: string };
};

export async function productCategoriesRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("cadastros.product_categories"));

      app.get(
        "/",
        { preHandler: [requireAuth, requirePermission("product_categories.read")] },
        controller.list,
      );

      app.get(
        "/tree",
        { preHandler: [requireAuth, requirePermission("product_categories.read")] },
        controller.tree,
      );

      app.get<IdParams>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("product_categories.read")] },
        controller.get,
      );

      app.post(
        "/",
        { preHandler: [requireAuth, requirePermission("product_categories.create")] },
        controller.create,
      );

      app.patch<IdParams>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("product_categories.update")] },
        controller.update,
      );

      app.delete<IdParams>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("product_categories.delete")] },
        controller.remove,
      );
    },
    { prefix: "/product-categories" },
  );
}