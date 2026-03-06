// apps/api/src/modules/auth/auth.repository.ts
import { getPool } from "../../config/db";

export async function getUserRoleCodes(companyId: number, userId: number): Promise<string[]> {
  const pool = await getPool();
  const res = await pool.request()
    .input("companyId", companyId)
    .input("userId", userId)
    .query(`
      SELECT r.code
      FROM dbo.user_roles ur
      JOIN dbo.roles r
        ON r.id = ur.role_id
       AND r.company_id = @companyId
       AND r.active = 1
      WHERE ur.user_id = @userId
      ORDER BY r.code
    `);

  return (res.recordset ?? [])
    .map((x: any) => String(x.code).toLowerCase())
    .filter(Boolean);
}

export async function getCompanyModules(companyId: number): Promise<string[]> {
  const pool = await getPool();
  const res = await pool.request()
    .input("companyId", companyId)
    .query(`
      SELECT cm.module_key
      FROM dbo.company_modules cm
      WHERE cm.company_id = @companyId
        AND cm.enabled = 1
      ORDER BY cm.module_key
    `);

  return (res.recordset ?? [])
    .map((x: any) => String(x.module_key))
    .filter(Boolean);
}

/**
 * Permissões do usuário no contexto da empresa.
 * Segurança:
 * - Garante que o role pertence à empresa (r.company_id = @companyId)
 * - (Opcional) garante que o user também pertence à empresa (u.company_id = @companyId)
 */
export async function getUserPermissions(companyId: number, userId: number): Promise<string[]> {
  const pool = await getPool();

  const res = await pool.request()
    .input("companyId", companyId)
    .input("userId", userId)
    .query(`
      SELECT DISTINCT p.code
      FROM dbo.user_roles ur

      JOIN dbo.roles r
        ON r.id = ur.role_id
       AND r.company_id = @companyId
       AND r.active = 1

      JOIN dbo.role_permissions rp
        ON rp.role_id = r.id

      JOIN dbo.permissions p
        ON p.id = rp.permission_id

      -- 🔥 AGORA O TENANT VEM DE user_companies (e não mais users.company_id)
      JOIN dbo.user_companies uc
        ON uc.user_id = ur.user_id
       AND uc.company_id = @companyId
       AND uc.active = 1

      JOIN dbo.users u
        ON u.id = ur.user_id
       AND u.active = 1

      WHERE ur.user_id = @userId

      ORDER BY p.code
    `);

  return (res.recordset ?? [])
    .map((x: any) => String(x.code))
    .filter(Boolean);
}

export type CurrentLicense = {
  status: "active" | "past_due" | "suspended" | "canceled";
  dueAt: string;
  graceDays: number;
  planCode: string;
  planName: string;
  userLimit: number;
  readOnly: boolean;
};

export async function getCurrentLicense(companyId: number): Promise<CurrentLicense | null> {
  const pool = await getPool();
  const res = await pool.request()
    .input("companyId", companyId)
    .query(`
      SELECT TOP 1
        status,
        due_at,
        ISNULL(user_limit_override, plan_user_limit) AS user_limit,
        plan_grace_days AS grace_days,
        plan_code,
        plan_name
      FROM dbo.v_company_current_license
      WHERE company_id = @companyId
      ORDER BY due_at DESC, id DESC
    `);

  const row = res.recordset?.[0];
  if (!row) return null;

  const dueAt = new Date(row.due_at);
  const graceDays = Number(row.grace_days ?? 0);
  const now = new Date();

  let status = String(row.status).toLowerCase() as CurrentLicense["status"];
  let readOnly = false;

  if (status === "active" && now > dueAt) status = "past_due";

  if (status === "past_due") {
    const graceUntil = new Date(dueAt.getTime() + graceDays * 24 * 60 * 60 * 1000);
    if (now > graceUntil) status = "suspended";
  }

  if (status === "suspended" || status === "canceled") {
    readOnly = true;
  }

  return {
    status,
    dueAt: dueAt.toISOString(),
    graceDays,
    planCode: String(row.plan_code),
    planName: String(row.plan_name),
    userLimit: Number(row.user_limit ?? 0),
    readOnly,
  };
}