import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../config/prehandlers";
import * as controller from "./accounts_receivable.controller";

type IdParams = { id: string };

export async function accountsReceivableRoutes(app: FastifyInstance) {
  app.get("/receivables", { preHandler: requireAuth }, controller.list);
  app.get<{ Params: IdParams }>("/receivables/:id", { preHandler: requireAuth }, controller.get);

  app.patch<{ Params: IdParams }>("/receivables/:id", { preHandler: requireAuth }, controller.update);
  app.post<{ Params: IdParams }>("/receivables/:id/cancel", { preHandler: requireAuth }, controller.cancel);

  // B) criar título a partir de uma venda
  app.post<{ Params: IdParams }>(
    "/receivables/from-sale/:id",
    { preHandler: requireAuth },
    controller.fromSale
  );

  // emissão (mock por enquanto)
  app.post<{ Params: IdParams }>(
    "/receivables/:id/issue",
    { preHandler: requireAuth },
    controller.issueMock
  );
}
