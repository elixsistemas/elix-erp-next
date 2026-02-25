import { getPool } from "../../config/db";
import bcrypt from "bcryptjs";

export async function listUsers(companyId: number) {
  const pool = await getPool();
  const res = await pool.request().input("companyId", companyId).query(`
    SELECT id, company_id, name, email, active, created_at
    FROM dbo.users
    WHERE company_id=@companyId
    ORDER BY name
  `);
  return res.recordset;
}

export async function getUser(companyId: number, id: number) {
  const pool = await getPool();
  const res = await pool.request().input("companyId", companyId).input("id", id).query(`
    SELECT id, company_id, name, email, active, created_at
    FROM dbo.users
    WHERE company_id=@companyId AND id=@id
  `);
  return res.recordset[0] ?? null;
}

export async function createUser(companyId: number, data: { name: string; email: string; password: string; active?: boolean }) {
  const pool = await getPool();
  const hash = await bcrypt.hash(data.password, 10);

  const res = await pool.request()
    .input("companyId", companyId)
    .input("name", data.name)
    .input("email", data.email.toLowerCase())
    .input("password_hash", hash)
    .input("active", data.active === false ? 0 : 1)
    .query(`
      INSERT INTO dbo.users(company_id, name, email, password_hash, role, active, created_at)
      OUTPUT INSERTED.id, INSERTED.company_id, INSERTED.name, INSERTED.email, INSERTED.active, INSERTED.created_at
      VALUES(@companyId, @name, @email, @password_hash, 'user', @active, sysutcdatetime())
    `);

  return res.recordset[0];
}

export async function updateUser(companyId: number, id: number, data: Partial<{ name: string; email: string; active: boolean }>) {
  const pool = await getPool();
  const res = await pool.request()
    .input("companyId", companyId)
    .input("id", id)
    .input("name", data.name ?? null)
    .input("email", data.email ? data.email.toLowerCase() : null)
    .input("active", typeof data.active === "boolean" ? (data.active ? 1 : 0) : null)
    .query(`
      UPDATE dbo.users
      SET
        name = COALESCE(@name, name),
        email = COALESCE(@email, email),
        active = COALESCE(@active, active)
      OUTPUT INSERTED.id, INSERTED.company_id, INSERTED.name, INSERTED.email, INSERTED.active, INSERTED.created_at
      WHERE company_id=@companyId AND id=@id
    `);

  return res.recordset[0] ?? null;
}

export async function setUserRoles(companyId: number, userId: number, roleIds: number[]) {
  const pool = await getPool();

  // garante user na empresa
  const u = await getUser(companyId, userId);
  if (!u) return null;

  // filtra roles para somente as da empresa
  const roles = await pool.request().input("companyId", companyId).query(`
    SELECT id FROM dbo.roles WHERE company_id=@companyId
  `);
  const allowed = new Set<number>(roles.recordset.map((r: any) => Number(r.id)));
  const finalIds = roleIds.filter(id => allowed.has(id));

  await pool.request().input("userId", userId).query(`DELETE FROM dbo.user_roles WHERE user_id=@userId`);

  for (const rid of finalIds) {
    await pool.request().input("userId", userId).input("roleId", rid).query(`
      INSERT INTO dbo.user_roles(user_id, role_id) VALUES(@userId, @roleId)
    `);
  }

  return true;
}

export async function getUserRoles(companyId: number, userId: number) {
  const pool = await getPool();
  const res = await pool.request().input("companyId", companyId).input("userId", userId).query(`
    SELECT r.id, r.code, r.name
    FROM dbo.user_roles ur
    JOIN dbo.roles r ON r.id = ur.role_id AND r.company_id=@companyId
    WHERE ur.user_id=@userId
    ORDER BY r.name
  `);
  return res.recordset;
}