import jwt from "jsonwebtoken";
import { env } from "./env";

export type AuthUser = {
  userId: number;
  companyId: number;
  role: string;
};

export function verifyAuth(header?: string): AuthUser | null {
  if (!header) return null;
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as any;
    return {
      userId: Number(payload.sub),
      companyId: Number(payload.companyId),
      role: String(payload.role ?? "user")
    };
  } catch {
    return null;
  }
}
