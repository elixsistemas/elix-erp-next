import type { FastifyInstance } from "fastify";
import * as controller from "./customers.controller";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { requireModule } from "@/config/requireModule";

type IdParams = { id: string };

export async function customersRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("cadastros.customers"));
      app.get(
        "/",
        { preHandler: [requireAuth, requirePermission("customers.read")] },
        controller.list
      );

      app.get<{ Params: IdParams }>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("customers.read")] },
        controller.get
      );

      app.post(
        "/",
        { preHandler: [requireAuth, requirePermission("customers.create")] },
        controller.create
      );

      app.patch<{ Params: IdParams }>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("customers.update")] },
        controller.update
      );

      app.delete<{ Params: IdParams }>(
        "/:id",
        { preHandler: [requireAuth, requirePermission("customers.delete")] },
        controller.remove
      );
    },
    { prefix: "/customers" }
  );
}