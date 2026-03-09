import type { FastifyInstance } from "fastify";
import {
  createChartAccountController,
  deleteChartAccountController,
  getChartAccountByIdController,
  getChartAccountsTreeController,
  listChartAccountsController,
  updateChartAccountController,
  updateChartAccountStatusController,
} from "./chart-of-accounts.controller";

import { requirePermission } from "@/config/prehandlers";
import { requireModule } from "@/config/requireModule";

type IdParams = { Params: { id: string } };
type UpdateStatusRoute = { Params: { id: string }; Body: { active: boolean } };

export async function chartOfAccountsRoutes(app: FastifyInstance) {
  app.register(
    async function (app) {
      app.addHook("preHandler", requireModule("finance.chart_of_accounts"));
     app.get(
      "/chart-of-accounts",
      {
        preHandler: [requirePermission("chart_of_accounts.read")],
      },
      listChartAccountsController,
    );

    app.get(
      "/chart-of-accounts/tree",
      {
        preHandler: [requirePermission("chart_of_accounts.read")],
      },
      getChartAccountsTreeController,
    );

    app.get<IdParams>(
      "/chart-of-accounts/:id",
      {
        preHandler: [requirePermission("chart_of_accounts.read")],
      },
      getChartAccountByIdController,
    );

    app.post(
      "/chart-of-accounts",
      {
        preHandler: [requirePermission("chart_of_accounts.create")],
      },
      createChartAccountController,
    );

    app.put<IdParams>(
      "/chart-of-accounts/:id",
      {
        preHandler: [requirePermission("chart_of_accounts.update")],
      },
      updateChartAccountController,
    );

    app.patch<UpdateStatusRoute>(
      "/chart-of-accounts/:id/status",
      {
        preHandler: [requirePermission("chart_of_accounts.update")],
      },
      updateChartAccountStatusController,
    );

    app.delete<IdParams>(
      "/chart-of-accounts/:id",
      {
        preHandler: [requirePermission("chart_of_accounts.delete")],
      },
      deleteChartAccountController,
      );
    },
    { prefix: "/financial" }
  );
}

export default chartOfAccountsRoutes;