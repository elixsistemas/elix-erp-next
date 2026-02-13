import type { FastifyInstance } from "fastify";
import * as controller from "./auth.controller";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/login", controller.login);
}
