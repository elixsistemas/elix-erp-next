import type { FastifyInstance } from "fastify";
import * as controller from "./branding.controller";

export async function brandingRoutes(app: FastifyInstance) {
  app.get("/branding", controller.branding);
}
