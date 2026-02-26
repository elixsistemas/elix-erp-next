import jwt from "jsonwebtoken";
import { env } from "./env";

export type AuthUser = {
  userId: number;
  companyId: number;
  roles: string[]; // compatível com multi-role
};

/**
 * Lê o JWT final (não é o loginTicket) e extrai:
 * - sub => userId
 * - companyId
 * - role/roles => roles[]
 *
 * Compatibilidade:
 * - tokens antigos: { role: "ADMIN" }
 * - tokens novos: { roles: ["admin", "user"] } ou { role: "admin" }
 */
export function verifyAuth(header?: string): AuthUser | null {
  if (!header) return null;

  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as any;

    // roles pode vir como:
    // - payload.roles (array)
    // - payload.role (string)
    const rolesRaw = Array.isArray(payload.roles)
      ? payload.roles
      : payload.role
        ? [payload.role]
        : [];

    const roles = rolesRaw
      .map((r: any) => String(r).toLowerCase())
      .filter(Boolean);

    const userId = Number(payload.sub);
    const companyId = Number(payload.companyId);

    if (!Number.isFinite(userId) || userId <= 0) return null;
    if (!Number.isFinite(companyId) || companyId <= 0) return null;

    // se nenhum role veio no token, assume "user"
    return { userId, companyId, roles: roles.length ? roles : ["user"] };
  } catch {
    return null;
  }
}