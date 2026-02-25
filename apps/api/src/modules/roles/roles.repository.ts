import { getPool } from "../../config/db";

export async function listRoles(companyId: number) {
  const pool = await getPool();
  const res = await pool.request().input("companyId", companyId).query(`
    SELECT id, company_id, code, name, active, created_at
    FROM dbo.roles
    WHERE company_id=@companyId
    ORDER BY name
  `);
  return res.recordset;
}

export async function createRole(companyId: number, data: { code: string; name: string }) {
  const pool = await getPool();
  const res = await pool.request()
    .input("companyId", companyId)
    .input("code", data.code.toLowerCase())
    .input("name", data.name)
    .query(`
      INSERT INTO dbo.roles(company_id, code, name)
      OUTPUT INSERTED.*
      VALUES(@companyId, @code, @name)
    `);
  return res.recordset[0];
}

export async function updateRole(companyId: number, id: number, data: Partial<{ code: string; name: string; active: boolean }>) {
  const pool = await getPool();
  const res = await pool.request()
    .input("companyId", companyId)
    .input("id", id)
    .input("code", data.code ? data.code.toLowerCase() : null)
    .input("name", data.name ?? null)
    .input("active", typeof data.active === "boolean" ? (data.active ? 1 : 0) : null)
    .query(`
      UPDATE dbo.roles
      SET
        code = COALESCE(@code, code),
        name = COALESCE(@name, name),
        active = COALESCE(@active, active)
      OUTPUT INSERTED.*
      WHERE id=@id AND company_id=@companyId
    `);
  return res.recordset[0] ?? null;
}

export async function deleteRole(companyId: number, id: number) {
  const pool = await getPool();
  // remove vínculos primeiro
  await pool.request().input("id", id).query(`DELETE FROM dbo.role_permissions WHERE role_id=@id; DELETE FROM dbo.user_roles WHERE role_id=@id;`);
  const res = await pool.request().input("companyId", companyId).input("id", id).query(`
    DELETE FROM dbo.roles WHERE id=@id AND company_id=@companyId;
    SELECT @@ROWCOUNT AS affected;
  `);
  return (res.recordset?.[0]?.affected ?? 0) > 0;
}

export async function listPermissionsCatalog() {
  const pool = await getPool();
  const res = await pool.request().query(`
    SELECT code, description, module
    FROM dbo.permissions
    ORDER BY module, code
  `);
  return res.recordset;
}

export async function getRoleGrantedPermissions(companyId: number, roleId: number) {
  const pool = await getPool();
  const res = await pool.request().input("companyId", companyId).input("roleId", roleId).query(`
    SELECT p.code
    FROM dbo.role_permissions rp
    JOIN dbo.permissions p ON p.id = rp.permission_id
    JOIN dbo.roles r ON r.id = rp.role_id AND r.company_id=@companyId
    WHERE rp.role_id=@roleId
    ORDER BY p.code
  `);
  return (res.recordset ?? []).map((x: any) => String(x.code));
}

export async function setRolePermissions(companyId: number, roleId: number, permissionCodes: string[]) {
  const pool = await getPool();

  // garante role pertence à empresa
  const chk = await pool.request().input("companyId", companyId).input("roleId", roleId).query(`
    SELECT id FROM dbo.roles WHERE id=@roleId AND company_id=@companyId
  `);
  if (!chk.recordset?.length) return null;

  // resolve permission ids
  const list = await pool.request().query(`SELECT id, code FROM dbo.permissions`);
  const map = new Map<string, number>(list.recordset.map((r: any) => [String(r.code), Number(r.id)]));

  const ids = permissionCodes
    .map(c => c.trim())
    .filter(Boolean)
    .map(c => map.get(c))
    .filter((x): x is number => typeof x === "number");

  // substitui set (simples e previsível)
  await pool.request().input("roleId", roleId).query(`DELETE FROM dbo.role_permissions WHERE role_id=@roleId`);

  for (const pid of ids) {
    await pool.request().input("roleId", roleId).input("pid", pid).query(`
      INSERT INTO dbo.role_permissions(role_id, permission_id) VALUES(@roleId, @pid)
    `);
  }

  return true;
}