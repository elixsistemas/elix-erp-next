import type { FastifyInstance } from "fastify";
import { requireAuth, requireRole } from "../../config/prehandlers";
import { InventoryMovementsRepository } from "./inventory_movements.repository";
import { InventoryMovementsService } from "./inventory_movements.service";
import { InventoryMovementsController } from "./inventory_movements.controller";

export async function inventoryMovementsRoutes(app: FastifyInstance) {
  const repo = new InventoryMovementsRepository();
  const service = new InventoryMovementsService(repo);
  const controller = new InventoryMovementsController(service);

  // criar movimento: apenas ADMIN
  app.post(
    "/movements",
    { preHandler: [requireAuth, requireRole("ADMIN")] },
    controller.create
  );

  // listar movimentos: qualquer autenticado
  app.get(
    "/movements",
    { preHandler: [requireAuth] },
    controller.list
  );
}
