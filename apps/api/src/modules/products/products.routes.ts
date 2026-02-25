import type { FastifyInstance } from "fastify";
import * as controller from "./products.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";

type IdParams = { id: string };

export async function productsRoutes(app: FastifyInstance) {
  app.get(
    "/products",
    { preHandler: [requireAuth, requirePermission("products.read")] },
    controller.list
  );

  app.get<{ Params: IdParams }>(
    "/products/:id",
    { preHandler: [requireAuth, requirePermission("products.read")] },
    controller.get
  );

  app.get<{ Params: IdParams }>(
    "/products/:id/stock",
    { preHandler: [requireAuth, requirePermission("products.read")] },
    controller.stock
  );

  app.post(
    "/products",
    { preHandler: [requireAuth, requirePermission("products.create")] },
    controller.create
  );

  app.patch<{ Params: IdParams }>(
    "/products/:id",
    { preHandler: [requireAuth, requirePermission("products.update")] },
    controller.update
  );

  app.delete<{ Params: IdParams }>(
    "/products/:id",
    { preHandler: [requireAuth, requirePermission("products.delete")] },
    controller.remove
  );
}