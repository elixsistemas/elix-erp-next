import type { FastifyInstance } from "fastify";
import * as controller from "./companies.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";

export async function companiesRoutes(app: FastifyInstance) {
  app.get(
    "/companies",
    { preHandler: [requireAuth, requirePermission("companies.read")] },
    controller.list
  );

  app.get(
    "/companies/me",
    { preHandler: [requireAuth, requirePermission("companies.read")] },
    controller.get
  );

  app.patch(
    "/companies/me",
    { preHandler: [requireAuth, requirePermission("companies.update")] },
    controller.update
  );

  app.post(
    "/companies",
    { preHandler: [requireAuth, requirePermission("companies.create")] },
    controller.create
  );

  app.delete(
    "/companies/:id",
    { preHandler: [requireAuth, requirePermission("companies.delete")] },
    controller.remove
  );

  app.post(
    "/companies/me/logo",
    { preHandler: [requireAuth, requirePermission("companies.update")] },
    controller.uploadLogo
  );

  app.delete(
    "/companies/me/logo",
    { preHandler: [requireAuth, requirePermission("companies.update")] },
    controller.deleteLogo
  );
}