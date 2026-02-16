import bcrypt from "bcrypt";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { getPool } from "../../config/db";
import type { LoginInput, PreLoginInput } from "./auth.schema";

type DbUserRow = {
  id: number;
  company_id: number;
  company_name?: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  active: boolean;
};

type DbCompany = { id: number; name: string };

export async function prelogin(input: PreLoginInput) {
  const pool = await getPool();

  // busca todas as empresas onde existe esse email (ativo)
  const result = await pool.request().input("email", input.email).query(`
    SELECT 
      u.id, u.company_id, u.name, u.email, u.password_hash, u.role, u.active,
      c.name as company_name
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    WHERE u.email=@email
  `);

  const rows = result.recordset as DbUserRow[];
  const candidates = rows.filter((r) => r.active);

  if (candidates.length === 0) return null;

  // valida senha contra QUALQUER empresa onde bata (mesma senha)
  // (se você tiver senhas diferentes por empresa pro mesmo email, isso vai exigir outro desenho)
  let okCompanies: DbCompany[] = [];

  for (const r of candidates) {
    const ok = await bcrypt.compare(input.password, r.password_hash);
    if (ok) {
      okCompanies.push({
        id: r.company_id,
        name: r.company_name ?? `Empresa ${r.company_id}`
      });
    }
  }

  if (okCompanies.length === 0) return null;

  // loginTicket temporário
  const secret: Secret = env.JWT_SECRET;
  const options: SignOptions = { expiresIn: "3m" };

  const loginTicket = jwt.sign(
    {
      companies: okCompanies.map((c) => c.id),
      email: input.email
    },
    secret,
    options
  );

  return {
    loginTicket,
    companies: okCompanies
  };
}

export async function login(input: LoginInput) {
  const secret: Secret = env.JWT_SECRET;

  // valida ticket
  let decoded: any;
  try {
    decoded = jwt.verify(input.loginTicket, secret);
  } catch {
    return null;
  }

  const email = decoded?.email as string | undefined;
  const allowedCompanies = decoded?.companies as number[] | undefined;

  if (!email || !Array.isArray(allowedCompanies)) return null;

  // garante que a empresa escolhida está permitida
  if (!allowedCompanies.includes(input.companyId)) return null;

  const pool = await getPool();

  // agora sim busca o user certo (empresa escolhida)
  const result = await pool
    .request()
    .input("company_id", input.companyId)
    .input("email", email)
    .query(`
      SELECT TOP 1 id, company_id, name, email, password_hash, role, active
      FROM users
      WHERE company_id=@company_id AND email=@email
    `);

  const user = result.recordset[0] as DbUserRow | undefined;
  if (!user || !user.active) return null;

  // emite o JWT final (igual ao teu atual)
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN };

  const token = jwt.sign(
    {
      sub: String(user.id),
      companyId: user.company_id,
      role: user.role
    },
    secret,
    options
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

export async function getMe(userId: number, companyId: number) {
  const pool = await getPool();

  // 1️⃣ User
  const userRes = await pool.request()
    .input("user_id", userId)
    .query(`
      SELECT id, name, email, role
      FROM users
      WHERE id = @user_id
    `);

  const user = userRes.recordset[0];

  // 2️⃣ Company
  const companyRes = await pool.request()
    .input("company_id", companyId)
    .query(`
      SELECT id, name
      FROM companies
      WHERE id = @company_id
    `);

  const company = companyRes.recordset[0];

  // 3️⃣ Modules (plano + override híbrido)
  const modulesRes = await pool.request()
    .input("company_id", companyId)
    .query(`
      SELECT module_key
      FROM company_modules
      WHERE company_id = @company_id
        AND enabled = 1
    `);

  const modules = modulesRes.recordset.map((r: any) => r.module_key);

  return {
    user,
    company,
    modules,
    permissions: [] // próxima etapa
  };
}

