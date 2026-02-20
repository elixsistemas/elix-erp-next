import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../config/prehandlers";
import * as controller from "./sales.controller";

type IdParams = { id: string };

export async function salesRoutes(app: FastifyInstance) {

  app.post<{ Params: IdParams }>(
    "/sales/:id/fiscal/issue",
    { preHandler: requireAuth },
    controller.issueFiscal
  );

  app.get<{ Params: IdParams }>(
    "/sales/:id/fiscal",
    { preHandler: requireAuth },
    controller.listFiscal
  );

  app.get("/sales", { preHandler: requireAuth }, controller.list);

  app.get<{ Params: IdParams }>(
    "/sales/:id",
    { preHandler: requireAuth },
    controller.get
  );

  app.post<{ Params: IdParams }>(
    "/sales/from-quote/:id",
    { preHandler: requireAuth },
    controller.fromQuote
  );

  app.post<{ Params: IdParams }>(
    "/sales/:id/cancel",
    { preHandler: requireAuth },
    controller.cancel
  );

  app.patch<{ Params: IdParams }>(
    "/sales/:id",
    { preHandler: requireAuth },
    controller.update
  );

  app.post<{ Params: IdParams }>(
  "/sales/:id/close",
  { preHandler: requireAuth },
  controller.close
);

app.post<{ Params: IdParams }>(
  "/sales/:id/installments/preview",
  { preHandler: requireAuth },
  controller.previewInstallments
);

}
