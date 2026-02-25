import type { FastifyInstance } from "fastify";
import * as controller from "./customers.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";

type IdParams = { id: string };

export async function customersRoutes(app: FastifyInstance) {
  app.get(
    "/customers",
    { preHandler: [requireAuth, requirePermission("customers.read")] },
    controller.list
  );

  app.get<{ Params: IdParams }>(
    "/customers/:id",
    { preHandler: [requireAuth, requirePermission("customers.read")] },
    controller.get
  );

  app.post(
    "/customers",
    { preHandler: [requireAuth, requirePermission("customers.create")] },
    controller.create
  );

  app.patch<{ Params: IdParams }>(
    "/customers/:id",
    { preHandler: [requireAuth, requirePermission("customers.update")] },
    controller.update
  );

  app.delete<{ Params: IdParams }>(
    "/customers/:id",
    { preHandler: [requireAuth, requirePermission("customers.delete")] },
    controller.remove
  );
}