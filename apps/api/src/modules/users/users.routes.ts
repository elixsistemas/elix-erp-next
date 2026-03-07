import type { FastifyInstance } from "fastify";
import * as controller from "./users.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireLicense } from "../../config/requireLicense";
import { requireModule } from "@/config/requireModule";

export async function usersRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("admin.users"));
      app.get("/", { preHandler: [requireAuth, requirePermission("users.read")] }, controller.list);
      app.get("/:id", { preHandler: [requireAuth, requirePermission("users.read")] }, controller.get);
      app.post("/",   { preHandler: [requireAuth, requireLicense, requirePermission("users.create")] }, controller.create);
      app.patch("/:id",{ preHandler:[requireAuth, requireLicense, requirePermission("users.update")] }, controller.update);

      app.get("/:id/roles", { preHandler: [requireAuth, requirePermission("users.read")] }, controller.roles);
      app.put("/:id/roles",{ preHandler:[requireAuth, requireLicense, requirePermission("users.update")] }, controller.setRoles);

      // ✅ NOVO: lookup por e-mail (para o front decidir criar vs vincular)
      app.get(
        "/lookup",
        { preHandler: [requireAuth, requirePermission("users.read")] },
        controller.lookupByEmail
      );

      // ✅ NOVO: vincular (e opcionalmente importar roles)
      app.post("/link",{ preHandler:[requireAuth, requireLicense, requirePermission("users.create")] }, controller.link);

    },
    { prefix: "/users" }
  );
}