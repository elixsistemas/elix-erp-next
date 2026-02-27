import { getPool } from "../../config/db";
import sql from "mssql";
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

// ✅ NOVO: checa se um usuário (actor/admin) é ativo em uma empresa
export async function userIsActiveInCompany(userId: number, companyId: number) {
  const pool = await getPool();
  const r = await pool.request()
    .input("userId", userId)
    .input("companyId", companyId)
    .query(`
      SELECT TOP 1 1 AS ok
      FROM dbo.user_companies
      WHERE user_id=@userId AND company_id=@companyId AND active=1
    `);
  return !!r.recordset?.[0]?.ok;
}

// ✅ NOVO: lookup por e-mail (sem vazar empresas que o admin não acessa)
export async function lookupUserByEmail(companyId: number, actorUserId: number, emailRaw: string) {
  const pool = await getPool();
  const email = String(emailRaw).toLowerCase().trim();

  const u = await pool.request()
    .input("email", email)
    .query(`
      SELECT TOP 1 id, name, email, active, created_at
      FROM dbo.users
      WHERE email=@email
    `);

  const user = u.recordset?.[0] ?? null;
  if (!user) return { exists: false, linked: false, user: null, importSources: [] as any[] };

  const link = await pool.request()
    .input("companyId", companyId)
    .input("userId", user.id)
    .query(`
      SELECT TOP 1 1 AS ok
      FROM dbo.user_companies
      WHERE company_id=@companyId AND user_id=@userId AND active=1
    `);

  const linked = !!link.recordset?.[0]?.ok;

  // ✅ somente empresas onde o ALVO e o ACTOR estão ativos
  const importSources = await pool.request()
    .input("targetUserId", user.id)
    .input("actorUserId", actorUserId)
    .query(`
      SELECT uc.company_id AS companyId, c.name
      FROM dbo.user_companies uc
      JOIN dbo.user_companies uc2
        ON uc2.company_id = uc.company_id
       AND uc2.user_id = @actorUserId
       AND uc2.active = 1
      JOIN dbo.companies c ON c.id = uc.company_id
      WHERE uc.user_id=@targetUserId
        AND uc.active=1
        AND c.is_active=1
        AND c.deleted_at IS NULL
      ORDER BY c.name
    `);

  return {
    exists: true,
    linked,
    user: { id: user.id, name: user.name, email: user.email, active: user.active, created_at: user.created_at },
    importSources: importSources.recordset ?? [],
  };
}

// ✅ NOVO: cria/vincula por e-mail sem resetar senha indevidamente
export async function linkUserToCompany(
  companyId: number,
  data: { email: string; name?: string; password?: string; active?: boolean }
) {
  const pool = await getPool();

  const email = data.email.toLowerCase().trim();
  const active = data.active === false ? 0 : 1;

  const tx = pool.transaction();
  await tx.begin();

  try {
    const existing = await tx.request()
      .input("email", email)
      .query(`
        SELECT TOP 1 id, name, email, active, created_at
        FROM dbo.users
        WHERE email=@email
      `);

    let userId: number;

    if (existing.recordset.length > 0) {
      userId = existing.recordset[0].id;

      // ativa/desativa global se quiser (mantém teu padrão)
      await tx.request()
        .input("id", userId)
        .input("active", active)
        .query(`UPDATE dbo.users SET active=@active WHERE id=@id`);

      // NÃO mexe em senha aqui (segurança)
    } else {
      // Se não existe, aí sim precisa senha
      if (!data.password) {
        await tx.rollback();
        throw new Error("Password required for new user");
      }
      const hash = await bcrypt.hash(data.password, 10);

      const created = await tx.request()
        .input("name", data.name ?? email.split("@")[0])
        .input("email", email)
        .input("password_hash", hash)
        .input("active", active)
        .query(`
          INSERT INTO dbo.users(name, email, password_hash, active, created_at)
          OUTPUT INSERTED.id
          VALUES(@name, @email, @password_hash, @active, sysutcdatetime())
        `);

      userId = created.recordset[0].id;
    }

    // vínculo na empresa: role_code mantém compatibilidade (não usamos como permissão real)
    await tx.request()
      .input("userId", userId)
      .input("companyId", companyId)
      .input("active", active)
      .query(`
        MERGE dbo.user_companies AS target
        USING (SELECT @userId AS user_id, @companyId AS company_id) AS src
          ON target.user_id = src.user_id AND target.company_id = src.company_id
        WHEN MATCHED THEN
          UPDATE SET active=@active
        WHEN NOT MATCHED THEN
          INSERT (user_id, company_id, role_code, active, created_at)
          VALUES (@userId, @companyId, 'user', @active, sysutcdatetime());
      `);

    // retorna no contexto da empresa
    const out = await tx.request()
      .input("userId", userId)
      .input("companyId", companyId)
      .query(`
        SELECT TOP 1
          u.id, u.name, u.email, u.active, u.created_at,
          uc.company_id, uc.role_code AS role
        FROM dbo.users u
        JOIN dbo.user_companies uc
          ON uc.user_id=u.id AND uc.company_id=@companyId
        WHERE u.id=@userId
      `);

    await tx.commit();
    return out.recordset[0];
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

// ✅ NOVO: importar roles (por code) de outra empresa para a empresa atual
export async function importUserRolesByCompanyCode(args: {
  targetCompanyId: number;
  fromCompanyId: number;
  userId: number;
}) {
  const pool = await getPool();

  // 1) pega roles do usuário na empresa origem (id/code/name)
  const srcRoles = await getUserRoles(args.fromCompanyId, args.userId);
  const codes = Array.from(new Set((srcRoles ?? []).map((r: any) => String(r.code).toLowerCase())));

  if (codes.length === 0) {
    // limpa roles no destino (ou deixa como está). Aqui vou manter SEM ALTERAR.
    return { imported: 0, ignored: 0 };
  }

  // 2) resolve codes -> roleIds no destino via TVP (reusa dbo.PermissionCodeList pq é só (code nvarchar))
  const tvp = new sql.Table("dbo.PermissionCodeList");
  tvp.columns.add("code", sql.NVarChar(80));
  for (const c of codes) tvp.rows.add(c);

  const r = await pool.request()
    .input("companyId", sql.Int, args.targetCompanyId)
    .input("codes", tvp)
    .query(`
      SELECT r.id, r.code
      FROM dbo.roles r
      JOIN @codes c ON c.code = r.code
      WHERE r.company_id=@companyId AND r.active=1
    `);

  const destIds = (r.recordset ?? []).map((x: any) => Number(x.id));
  const foundCodes = new Set((r.recordset ?? []).map((x: any) => String(x.code).toLowerCase()));
  const ignored = codes.filter(c => !foundCodes.has(c));

  // 3) aplica no destino (TX já existe dentro de setUserRoles)
  await setUserRoles(args.targetCompanyId, args.userId, destIds);

  return { imported: destIds.length, ignored: ignored.length, ignoredCodes: ignored };
}