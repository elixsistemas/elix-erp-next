import type { FastifyInstance } from "fastify";
import * as controller from "./users.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";

export async function usersRoutes(app: FastifyInstance) {
  app.get("/users", { preHandler: [requireAuth, requirePermission("users.read")] }, controller.list);
  app.get("/users/:id", { preHandler: [requireAuth, requirePermission("users.read")] }, controller.get);
  app.post("/users", { preHandler: [requireAuth, requirePermission("users.create")] }, controller.create);
  app.patch("/users/:id", { preHandler: [requireAuth, requirePermission("users.update")] }, controller.update);

  app.get("/users/:id/roles", { preHandler: [requireAuth, requirePermission("users.read")] }, controller.roles);
  app.put("/users/:id/roles", { preHandler: [requireAuth, requirePermission("users.update")] }, controller.setRoles);
}