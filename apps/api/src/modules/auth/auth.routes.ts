import type { FastifyInstance } from "fastify";
import * as controller from "./auth.controller";
import { requireAuth } from "../../config/prehandlers";

export async function authRoutes(app: FastifyInstance) {
  // públicas
  app.post("/auth/prelogin", controller.prelogin);
  app.post("/auth/login", controller.login);

  // protegida (canônica)
  app.get("/auth/me", { preHandler: requireAuth }, controller.me);

  // ✅ novas rotas
  app.get("/auth/companies", { preHandler: requireAuth }, controller.companies);
  app.post("/auth/switch", { preHandler: requireAuth }, controller.switchCompany);

  // alias (mantém compatibilidade, sem duplicar payload)
  app.get("/me", { preHandler: requireAuth }, controller.me);
}