import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyAuth } from "./auth";

declare module "fastify" {
  interface FastifyRequest {
    auth?: { userId: number; companyId: number; role: string };
  }
}

export async function requireAuth(req: FastifyRequest, rep: FastifyReply) {
  const auth = verifyAuth(req.headers.authorization);
  if (!auth) return rep.code(401).send({ message: "Unauthorized" });
  req.auth = auth;
}
