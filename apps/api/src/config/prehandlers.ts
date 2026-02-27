// apps/api/src/config/prehandlers.ts
import type {
  FastifyRequest,
  FastifyReply,
  preHandlerHookHandler,
} from "fastify";
import { verifyAuth } from "./auth";
import { getUserPermissions } from "../modules/auth/auth.repository";

declare module "fastify" {
  interface FastifyRequest {
    auth?: {
      userId: number;
      companyId: number;
      roles: string[];
      perms: string[]; // deixa obrigatório (evita optional-chaining em todo lugar)
    };
  }
}

const PUBLIC_PREFIXES = ["/auth/prelogin", "/auth/login", "/branding", "/health"] as const;
const PUBLIC_METHODS = ["OPTIONS"] as const;

function isPublic(req: FastifyRequest) {
  if ((PUBLIC_METHODS as readonly string[]).includes(req.method)) return true;
  const url = req.url.split("?")[0];
  return (PUBLIC_PREFIXES as readonly string[]).some((p) => url.startsWith(p));
}

/**
 * requireAuth:
 * - ignora rotas públicas
 * - reaproveita req.auth do plugin se já existir
 * - garante perms carregadas (1x por request)
 */
export const requireAuth: preHandlerHookHandler = async (req, rep) => {
  if (isPublic(req)) return;

  // 1) já veio do plugin? reaproveita
  let base = req.auth;

  // 2) senão, valida agora via header Authorization
  if (!base) {
    const parsed = verifyAuth(req.headers.authorization);
    if (!parsed) return rep.code(401).send({ message: "Unauthorized" });

    // ainda sem perms aqui
    base = { ...parsed, perms: [] };
  }

  // 3) garante perms (só se ainda não tiver)
  if (!Array.isArray(base.perms) || base.perms.length === 0) {
    const perms = await getUserPermissions(base.companyId, base.userId);
    req.auth = { ...base, perms };
    return;
  }

  // já está completo
  req.auth = base;
};

export function requirePermission(code: string): preHandlerHookHandler {
  const need = code.trim().toLowerCase();

  return async (req, rep) => {
    if (!req.auth) return rep.code(401).send({ message: "Unauthorized" });

    const ok = req.auth.perms.some((p) => p.trim().toLowerCase() === need);
    if (!ok) return rep.code(403).send({ message: "Forbidden", missing: code });
  };
}

export function requireAnyRole(...allowed: string[]): preHandlerHookHandler {
  const allowedLc = allowed.map((a) => a.toLowerCase());
  return async (req, rep) => {
    if (!req.auth) return rep.code(401).send({ message: "Unauthorized" });

    const ok = req.auth.roles.some((r) => allowedLc.includes(r.toLowerCase()));
    if (!ok) return rep.code(403).send({ message: "Forbidden" });
  };
}