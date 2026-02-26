import bcrypt from "bcrypt";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { getPool } from "../../config/db";
import type { LoginInput, PreLoginInput } from "./auth.schema";
import { getUserRoleCodes } from "./auth.repository";

type CompanyLite = { id: number; name: string };

export async function listUserCompanies(userId: number): Promise<CompanyLite[]> {
  const pool = await getPool();

  const res = await pool.request()
    .input("userId", userId)
    .query(`
      SELECT DISTINCT c.id, c.name
      FROM dbo.user_companies uc
      JOIN dbo.companies c ON c.id = uc.company_id
      JOIN dbo.users u ON u.id = uc.user_id
      WHERE uc.user_id = @userId
        AND uc.active = 1
        AND u.active = 1
      ORDER BY c.name
    `);

  return (res.recordset ?? []).map((r: any) => ({ id: Number(r.id), name: String(r.name) }));
}

export async function switchCompany(userId: number, companyId: number): Promise<{ token: string } | null> {
  const pool = await getPool();

  const res = await pool
    .request()
    .input("userId", userId)
    .input("companyId", companyId)
    .query(`
      SELECT TOP 1
        u.id,
        uc.company_id,
        uc.role_code
      FROM dbo.users u
      JOIN dbo.user_companies uc
        ON uc.user_id = u.id
       AND uc.company_id = @companyId
       AND uc.active = 1
      WHERE u.id = @userId
        AND u.active = 1
    `);

  const row = res.recordset?.[0];
  if (!row) return null;

  const secret: Secret = env.JWT_SECRET;
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN };

  const role = String(row.role);

  const token = jwt.sign(
    {
      sub: String(row.id),
      companyId: Number(row.company_id),
      role,           // mantém compat
      roles: [role],  // ✅ ajuda seu req.auth.roles (se o verifyAuth suportar)
    },
    secret,
    options
  );

  return { token };
}

type DbUserIdentity = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  active: boolean;
};

type DbCompany = { id: number; name: string };

type DbUserCompanyLink = {
  role: string;
  active: boolean;
};

export async function prelogin(input: PreLoginInput) {
  const pool = await getPool();

  // 1) Identidade única por email
  const userRes = await pool.request().input("email", input.email).query(`
    SELECT TOP 1
      id, name, email, password_hash, active
    FROM dbo.users
    WHERE email = @email
  `);

  const user = userRes.recordset[0] as DbUserIdentity | undefined;
  if (!user || !user.active) return null;

  // 2) Valida senha UMA vez
  const ok = await bcrypt.compare(input.password, user.password_hash);
  if (!ok) return null;

  // 3) Lista SOMENTE as empresas onde o usuário tem vínculo ativo
  const compRes = await pool.request().input("user_id", user.id).query(`
    SELECT c.id, c.name
    FROM dbo.user_companies uc
    JOIN dbo.companies c ON c.id = uc.company_id
    WHERE uc.user_id = @user_id
      AND uc.active = 1
    ORDER BY c.name
  `);

  const companies = (compRes.recordset as DbCompany[]) ?? [];
  if (companies.length === 0) return null;

  // 4) loginTicket temporário
  const secret: Secret = env.JWT_SECRET;
  const options: SignOptions = { expiresIn: "3m" };

  const loginTicket = jwt.sign(
    {
      userId: user.id,
      companies: companies.map((c) => c.id),
      email: user.email, // opcional (ajuda debug)
    },
    secret,
    options
  );

  return {
    loginTicket,
    companies,
  };
}

export async function login(input: LoginInput) {
  const secret: Secret = env.JWT_SECRET;

  // 1) valida ticket
  let decoded: any;
  try {
    decoded = jwt.verify(input.loginTicket, secret);
  } catch {
    return null;
  }

  const userId = Number(decoded?.userId);
  const allowedCompanies = decoded?.companies as number[] | undefined;

  if (!Number.isFinite(userId) || userId <= 0) return null;
  if (!Array.isArray(allowedCompanies)) return null;

  // 2) garante que a empresa escolhida está no ticket
  if (!allowedCompanies.includes(input.companyId)) return null;

  const pool = await getPool();

  // 3) Confirma vínculo ativo + pega role POR EMPRESA (papéis diferentes)
  const linkRes = await pool
    .request()
    .input("user_id", userId)
    .input("company_id", input.companyId)
    .query(`
      SELECT TOP 1 role_code AS role, active
      FROM dbo.user_companies
      WHERE user_id = @user_id AND company_id = @company_id
    `);

  const link = linkRes.recordset[0] as DbUserCompanyLink | undefined;
  if (!link || !link.active) return null;

  const roles = await getUserRoleCodes(input.companyId, userId);
  const rolesFinal = roles.length ? roles : ["user"];

  // role primário só pra compatibilidade (opcional)
  const primaryRole = rolesFinal.includes("admin") ? "admin" : rolesFinal[0];

  // 4) Busca identidade do user (nome/email/ativo)
  const userRes = await pool.request().input("user_id", userId).query(`
    SELECT TOP 1 id, name, email, active
    FROM dbo.users
    WHERE id = @user_id
  `);

  const user = userRes.recordset[0] as { id: number; name: string; email: string; active: boolean } | undefined;
  if (!user || !user.active) return null;

  // 5) emite o JWT final (compatível com o verifyAuth atual)
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN };

  const token = jwt.sign(
    {
      sub: String(user.id),
      companyId: input.companyId,
      roles: rolesFinal,     // ✅ multi-role real
      role: primaryRole      // ✅ compat legado (pode manter por enquanto)
    },
    secret,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      companyId: input.companyId,
      name: user.name,
      email: user.email,
      role: link.role,
    },
  };
}

/**
 * Mantive seu getMe do jeito que está, mas removi dependência de users.role/company_id.
 * Se você quiser, depois eu ajusto para também devolver role do vínculo.
 */
export async function getMe(userId: number, companyId: number) {
  const pool = await getPool();

  // 1️⃣ User (identidade)
  const userRes = await pool
    .request()
    .input("user_id", userId)
    .query(`
      SELECT id, name, email, active
      FROM dbo.users
      WHERE id = @user_id
    `);

  const user = userRes.recordset[0];

  // 2️⃣ Company
  const companyRes = await pool
    .request()
    .input("company_id", companyId)
    .query(`
      SELECT id, name
      FROM dbo.companies
      WHERE id = @company_id
    `);

  const company = companyRes.recordset[0];

  // 3️⃣ Modules
  const modulesRes = await pool
    .request()
    .input("company_id", companyId)
    .query(`
      SELECT module_key
      FROM dbo.company_modules
      WHERE company_id = @company_id
        AND enabled = 1
    `);

  const modules = modulesRes.recordset.map((r: any) => r.module_key);

  return {
    user,
    company,
    modules,
    permissions: [], // próxima etapa (você já está pegando via /auth/me com repository)
  };
}