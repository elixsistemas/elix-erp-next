import type { FastifyInstance } from "fastify";
import * as controller from "./products.controller";
import { requireAuth } from "../../config/prehandlers";

type IdParams = { id: string };

export async function productsRoutes(app: FastifyInstance) {
  app.get("/products", { preHandler: requireAuth }, controller.list);

  app.get<{ Params: IdParams }>(
    "/products/:id",
    { preHandler: requireAuth },
    controller.get
  );

  app.get<{ Params: IdParams }>(
    "/products/:id/stock",
    { preHandler: requireAuth },
    controller.stock
  );

  app.post("/products", { preHandler: requireAuth }, controller.create);

  app.patch<{ Params: IdParams }>(
    "/products/:id",
    { preHandler: requireAuth },
    controller.update
  );

  app.delete<{ Params: IdParams }>(
    "/products/:id",
    { preHandler: requireAuth },
    controller.remove
  );
}
