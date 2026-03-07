import type { FastifyInstance } from "fastify";
import * as controller from "./companies.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireModule } from "../../config/requireModule";

export async function companiesRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("cadastros.companies"));
      app.get(
        "/",
        { preHandler: [requireAuth, requirePermission("companies.read")] },
        controller.list
      );

      app.get(
        "/me",
        { preHandler: [requireAuth, requirePermission("companies.read")] },
        controller.get
      );

      app.patch(
        "/me",
        { preHandler: [requireAuth, requirePermission("companies.update")] },
        controller.update
      );

      app.post(
        "/",
        { preHandler: [requireAuth, requirePermission("companies.create")] },
        controller.create
      );

      app.delete(
        "/:id",
        { preHandler: [requireAuth, requirePermission("companies.delete")] },
        controller.remove
      );

      app.post(
        "/me/logo",
        { preHandler: [requireAuth, requirePermission("companies.update")] },
        controller.uploadLogo
      );

      app.delete(
        "/me/logo",
        { preHandler: [requireAuth, requirePermission("companies.update")] },
        controller.deleteLogo
      );
    },
    { prefix: "/companies" }
  );
}