import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { getPool } from "../../config/db";
import type { LoginInput } from "./auth.schema";

type DbUser = {
  id: number;
  company_id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  active: boolean;
};

export async function login(input: LoginInput) {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("company_id", input.companyId)
    .input("email", input.email)
    .query(`
      SELECT TOP 1 id, company_id, name, email, password_hash, role, active
      FROM users
      WHERE company_id=@company_id AND email=@email
    `);

  const user = result.recordset[0] as DbUser | undefined;
  if (!user || !user.active) {
    return null;
  }

  const ok = await bcrypt.compare(input.password, user.password_hash);
  if (!ok) return null;

  const token = jwt.sign(
    {
      sub: String(user.id),
      companyId: user.company_id,
      role: user.role
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      companyId: user.company_id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}
