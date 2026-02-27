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

  // ✅ NOVO: lookup por e-mail (para o front decidir criar vs vincular)
  app.get(
    "/users/lookup",
    { preHandler: [requireAuth, requirePermission("users.read")] },
    controller.lookupByEmail
  );

  // ✅ NOVO: vincular (e opcionalmente importar roles)
  app.post(
    "/users/link",
    { preHandler: [requireAuth, requirePermission("users.create")] },
    controller.link
  );
}