import type { FastifyInstance } from "fastify";
import { requireAuth, requirePermission } from "../../config/prehandlers";
import { InventoryMovementsRepository } from "./inventory_movements.repository";
import { InventoryMovementsService } from "./inventory_movements.service";
import { InventoryMovementsController } from "./inventory_movements.controller";
import type { z } from "zod";
import { createMovementSchema, listMovementsQuerySchema } from "./inventory_movements.schemas";

type CreateBody = z.infer<typeof createMovementSchema>;
type ListQuery = z.infer<typeof listMovementsQuerySchema>;

export async function inventoryMovementsRoutes(app: FastifyInstance) {
  const repo = new InventoryMovementsRepository();
  const service = new InventoryMovementsService(repo);
  const controller = new InventoryMovementsController(service);

  app.post<{ Body: CreateBody }>(
    "/inventory/movements",
    {
      preHandler: [
        requireAuth,
        requirePermission("inventory_movements.create"),
      ],
    },
    controller.create
  );

  app.get<{ Querystring: ListQuery }>(
    "/inventory/movements",
    { preHandler: [requireAuth, requirePermission("inventory_movements.read")] },
    controller.list
  );
}