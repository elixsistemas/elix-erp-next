import type { FastifyInstance } from "fastify";
import * as controller from "./suppliers.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";

export async function suppliersRoutes(app: FastifyInstance) {
  app.get(
    "/suppliers",
    { preHandler: [requireAuth, requirePermission("suppliers.read")] },
    controller.list
  );

  app.get(
    "/suppliers/:id",
    { preHandler: [requireAuth, requirePermission("suppliers.read")] },
    controller.get
  );

  app.post(
    "/suppliers",
    { preHandler: [requireAuth, requirePermission("suppliers.create")] },
    controller.create
  );

  app.patch(
    "/suppliers/:id",
    { preHandler: [requireAuth, requirePermission("suppliers.update")] },
    controller.update
  );

  app.delete(
    "/suppliers/:id",
    { preHandler: [requireAuth, requirePermission("suppliers.delete")] },
    controller.remove
  );
}