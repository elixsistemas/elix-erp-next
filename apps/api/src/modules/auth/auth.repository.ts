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