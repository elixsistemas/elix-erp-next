import type { FastifyInstance } from "fastify";
import * as controller from "./roles.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";

export async function rolesRoutes(app: FastifyInstance) {
  app.get("/roles", { preHandler: [requireAuth, requirePermission("roles.read")] }, controller.list);
  app.post("/roles", { preHandler: [requireAuth, requirePermission("roles.create")] }, controller.create);
  app.patch("/roles/:id", { preHandler: [requireAuth, requirePermission("roles.update")] }, controller.update);
  app.delete("/roles/:id", { preHandler: [requireAuth, requirePermission("roles.delete")] }, controller.remove);

  app.get("/permissions", { preHandler: [requireAuth, requirePermission("roles.read")] }, controller.permissionsCatalog);

  app.get("/roles/:id/permissions", { preHandler: [requireAuth, requirePermission("roles.read")] }, controller.getGranted);
  app.put("/roles/:id/permissions", { preHandler: [requireAuth, requirePermission("roles.grant")] }, controller.grant);
}