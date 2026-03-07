import type { FastifyInstance } from "fastify";
import * as controller from "./products.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireModule } from "@/config/requireModule";

type IdParams = { id: string };

export async function productsRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("cadastros.products"));
      app.get(
        "/",
        { preHandler: [requireAuth, requirePermission("products.read")] },
        controller.list
      );

      app.get<{ Params: IdParams }>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("products.read")] },
        controller.get
      );

      app.get<{ Params: IdParams }>(
        "/:id/stock",
        { preHandler: [requireAuth, requirePermission("products.read")] },
        controller.stock
      );

      app.post(
        "/",
        { preHandler: [requireAuth, requirePermission("products.create")] },
        controller.create
      );

      app.patch<{ Params: IdParams }>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("products.update")] },
        controller.update
      );

      app.delete<{ Params: IdParams }>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("products.delete")] },
        controller.remove
      );
    },
    { prefix: "/products" }
  );
}