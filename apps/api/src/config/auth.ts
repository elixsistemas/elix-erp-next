import jwt from "jsonwebtoken";
import { env } from "./env";

export type AuthUser = {
  userId: number;
  companyId: number;
  roles: string[]; // compatível com multi-role
};

export function verifyAuth(header?: string): AuthUser | null {
  if (!header) return null;
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as any;

    const rolesRaw = Array.isArray(payload.roles)
      ? payload.roles
      : payload.role
        ? [payload.role]
        : [];

    const roles = rolesRaw.map((r: any) => String(r).toLowerCase()).filter(Boolean);

    const userId = Number(payload.sub);
    const companyId = Number(payload.companyId);
    if (!Number.isFinite(userId) || !Number.isFinite(companyId)) return null;

    return { userId, companyId, roles: roles.length ? roles : ["user"] };
  } catch {
    return null;
  }
}