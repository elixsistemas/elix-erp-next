import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyAuth } from "./auth";

declare module "fastify" {
  interface FastifyRequest {
    auth?: { userId: number; companyId: number; role: string };
  }
}

export async function requireAuth(req: FastifyRequest, rep: FastifyReply) {
  const auth = verifyAuth(req.headers.authorization);

  if (!auth) {
    return rep.code(401).send({ message: "Unauthorized" });
  }

  req.auth = auth;
}

export function requireRole(...allowed: string[]) {
  return async function (req: FastifyRequest, rep: FastifyReply) {
    // requireAuth deve rodar antes, mas deixo seguro
    if (!req.auth) {
      return rep.code(401).send({ message: "Unauthorized" });
    }

    if (!allowed.includes(req.auth.role)) {
      return rep.code(403).send({ message: "Forbidden" });
    }
  };
}
