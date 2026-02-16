import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

type JwtPayload = {
  sub: string;
  companyId: number;
  role: string;
};

export default fp(async function authPlugin(app: FastifyInstance) {
  app.addHook("preHandler", async (req, rep) => {
    // ✅ 0) liberar preflight sempre
    if (req.method === "OPTIONS") return;

    // ✅ 1) rotas públicas
    if (
      req.url.startsWith("/health") ||
      req.url.startsWith("/auth/login") ||
      req.url.startsWith("/auth/prelogin")
    ) {
      return;
    }

    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return rep.code(401).send({ message: "Unauthorized" });
    }

    try {
      const token = auth.slice(7);
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

      (req as any).user = {
        id: Number(payload.sub),
        companyId: Number(payload.companyId),
        role: String(payload.role),
      };
    } catch {
      return rep.code(401).send({ message: "Unauthorized" });
    }
  });
});
