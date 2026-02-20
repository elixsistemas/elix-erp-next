import type { FastifyInstance } from "fastify";
import * as controller from "./customers.controller";
import { requireAuth } from "../../config/prehandlers";

type IdParams = { id: string };

export async function customersRoutes(app: FastifyInstance) {
  app.get("/customers", { preHandler: requireAuth }, controller.list);

  app.get<{ Params: IdParams }>(
    "/customers/:id",
    { preHandler: requireAuth },
    controller.get
  );

  app.post("/customers", { preHandler: requireAuth }, controller.create);

  app.patch<{ Params: IdParams }>(
    "/customers/:id",
    { preHandler: requireAuth },
    controller.update
  );

  app.delete<{ Params: IdParams }>(
    "/customers/:id",
    { preHandler: requireAuth },
    controller.remove
  );
}
