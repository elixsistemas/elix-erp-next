import { getPool } from "../../config/db";
import bcrypt from "bcryptjs";

export async function listUsers(companyId: number) {
  const pool = await getPool();
  const res = await pool.request()
    .input("companyId", companyId)
    .query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.active,
        u.created_at,
        uc.company_id,
        uc.role_code AS role
      FROM dbo.user_companies uc
      JOIN dbo.users u
        ON u.id = uc.user_id
      WHERE uc.company_id = @companyId
        AND uc.active = 1
        AND u.active = 1
      ORDER BY u.name
    `);

  return res.recordset;
}

export async function getUser(companyId: number, id: number) {
  const pool = await getPool();

  const res = await pool.request()
    .input("companyId", companyId)
    .input("id", id)
    .query(`
      SELECT TOP 1
        u.id,
        u.name,
        u.email,
        u.active,
        u.created_at,
        uc.company_id,
        uc.role_code AS role
      FROM dbo.users u
      JOIN dbo.user_companies uc
        ON uc.user_id = u.id
       AND uc.company_id = @companyId
       AND uc.active = 1
      WHERE u.id = @id
        AND u.active = 1
    `);

  return res.recordset[0] ?? null;
}

export async function createUser(
  companyId: number,
  data: { name: string; email: string; password: string; active?: boolean; roleCode?: string }
) {
  const pool = await getPool();

  const email = data.email.toLowerCase().trim();
  const active = data.active === false ? 0 : 1;
  const role = (data.roleCode ?? "user").trim(); // mantém compatibilidade do payload

  const hash = await bcrypt.hash(data.password, 10);

  const tx = pool.transaction();
  await tx.begin();

  try {
    // 1) acha usuário global pelo email
    const existing = await tx
      .request()
      .input("email", email)
      .query(`
        SELECT TOP 1 id, name, email, active, created_at
        FROM dbo.users
        WHERE email = @email
      `);

    let userId: number;

    if (existing.recordset.length > 0) {
      userId = existing.recordset[0].id;

      // garante usuário global ativo (opcional, mas útil)
      await tx.request()
        .input("id", userId)
        .input("active", active)
        .query(`
          UPDATE dbo.users
          SET active = @active
          WHERE id = @id
        `);

      // senha: não atualiza aqui pra não resetar sem querer
    } else {
      // cria usuário global
      const created = await tx
        .request()
        .input("name", data.name)
        .input("email", email)
        .input("password_hash", hash)
        .input("active", active)
        .query(`
          INSERT INTO dbo.users(name, email, password_hash, active, created_at)
          OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.active, INSERTED.created_at
          VALUES(@name, @email, @password_hash, @active, sysutcdatetime())
        `);

      userId = created.recordset[0].id;
    }

    // 2) cria vínculo na empresa (se já existir, atualiza role/active)
    await tx
      .request()
      .input("userId", userId)
      .input("companyId", companyId)
      .input("role", role)
      .input("active", active)
      .query(`
        MERGE dbo.user_companies AS target
        USING (SELECT @userId AS user_id, @companyId AS company_id) AS src
          ON target.user_id = src.user_id AND target.company_id = src.company_id
        WHEN MATCHED THEN
          UPDATE SET role_code = @role, active = @active
        WHEN NOT MATCHED THEN
          INSERT (user_id, company_id, role_code, active, created_at)
          VALUES (@userId, @companyId, @role, @active, sysutcdatetime());
      `);

    // 3) retorna user no contexto da empresa (já com role)
    const out = await tx
      .request()
      .input("userId", userId)
      .input("companyId", companyId)
      .query(`
        SELECT TOP 1
          u.id,
          u.name,
          u.email,
          u.active,
          u.created_at,
          uc.company_id,
          uc.role_code AS role
        FROM dbo.users u
        JOIN dbo.user_companies uc
          ON uc.user_id = u.id
         AND uc.company_id = @companyId
        WHERE u.id = @userId
      `);

    await tx.commit();
    return out.recordset[0];
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

export async function updateUser(
  companyId: number,
  id: number,
  data: Partial<{ name: string; email: string; active: boolean }>
) {
  const pool = await getPool();

  const res = await pool.request()
    .input("companyId", companyId)
    .input("id", id)
    .input("name", data.name ?? null)
    .input("email", data.email ? data.email.toLowerCase().trim() : null)
    .input("active", typeof data.active === "boolean" ? (data.active ? 1 : 0) : null)
    .query(`
      UPDATE u
      SET
        name   = COALESCE(@name, u.name),
        email  = COALESCE(@email, u.email),
        active = COALESCE(@active, u.active)
      OUTPUT
        INSERTED.id,
        INSERTED.name,
        INSERTED.email,
        INSERTED.active,
        INSERTED.created_at,
        uc.company_id,
        uc.role_code AS role
      FROM dbo.users u
      JOIN dbo.user_companies uc
        ON uc.user_id = u.id
       AND uc.company_id = @companyId
       AND uc.active = 1
      WHERE u.id = @id;
    `);

  return res.recordset[0] ?? null;
}

export async function setUserRoles(companyId: number, userId: number, roleIds: number[]) {
  const pool = await getPool();

  // garante user na empresa
  const u = await getUser(companyId, userId);
  if (!u) return null;

  // filtra roles somente da empresa
  const rolesRes = await pool
    .request()
    .input("companyId", companyId)
    .query(`SELECT id FROM dbo.roles WHERE company_id=@companyId AND active=1`);

  const allowed = new Set<number>(rolesRes.recordset.map((r: any) => Number(r.id)));
  const finalIds = roleIds.map(Number).filter((id) => allowed.has(id));

  // ✅ tudo num TX para evitar concorrência/double submit
  const tx = pool.transaction();
  await tx.begin();

  try {
    // apaga SOMENTE os vínculos de roles dessa empresa
    await tx
      .request()
      .input("userId", userId)
      .input("companyId", companyId)
      .query(`
        DELETE ur
        FROM dbo.user_roles ur
        JOIN dbo.roles r ON r.id = ur.role_id
        WHERE ur.user_id = @userId
          AND r.company_id = @companyId
      `);

    // insere os novos vínculos
    for (const rid of finalIds) {
      await tx
        .request()
        .input("userId", userId)
        .input("roleId", rid)
        .query(`
          INSERT INTO dbo.user_roles(user_id, role_id)
          VALUES(@userId, @roleId)
        `);
    }

    await tx.commit();
    return true;
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

export async function getUserRoles(companyId: number, userId: number) {
  const pool = await getPool();
  const res = await pool.request()
    .input("companyId", companyId)
    .input("userId", userId)
    .query(`
      SELECT r.id, r.code, r.name
      FROM dbo.user_roles ur
      JOIN dbo.roles r
        ON r.id = ur.role_id
       AND r.company_id=@companyId
       AND r.active = 1
      JOIN dbo.user_companies uc
        ON uc.user_id = ur.user_id
       AND uc.company_id = @companyId
       AND uc.active = 1
      WHERE ur.user_id=@userId
      ORDER BY r.name
    `);

  return res.recordset;
}