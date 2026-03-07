import type { FastifyInstance } from "fastify";
import * as controller from "./roles.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireModule } from "@/config/requireModule";

export async function rolesRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("admin.roles"));
      app.get("/", { preHandler: [requireAuth, requirePermission("roles.read")] }, controller.list);
      app.post("/", { preHandler: [requireAuth, requirePermission("roles.create")] }, controller.create);
      app.patch("/:id", { preHandler: [requireAuth, requirePermission("roles.update")] }, controller.update);
      app.delete("/:id", { preHandler: [requireAuth, requirePermission("roles.delete")] }, controller.remove);

      app.get("/permissions", { preHandler: [requireAuth, requirePermission("roles.read")] }, controller.permissionsCatalog);

      app.get("/:id/permissions", { preHandler: [requireAuth, requirePermission("roles.read")] }, controller.getGranted);
      app.put("/:id/permissions", { preHandler: [requireAuth, requirePermission("roles.grant")] }, controller.grant);

    },
    { prefix: "/roles" }
  );
}