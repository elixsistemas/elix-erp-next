import { getPool } from "../../config/db";

export type ListQuery = {
  search?: string;
  active?: string; // "1" | "0" | undefined
  page?: string;
  pageSize?: string;
};

export type CfopCreate = {
  code: string;
  description: string;
  nature: number | null;
  active: boolean;
};

export type CfopUpdate = Partial<CfopCreate>;

export type NcmCreate = {
  code: string;
  description: string;
  ex: string | null;
  start_date: string | null; // "YYYY-MM-DD" | null
  end_date: string | null;
  active: boolean;
};

export type NcmUpdate = Partial<NcmCreate>;

function parsePaging(q: ListQuery) {
  const page = Math.max(1, Number(q.page ?? 1));
  const pageSize = Math.min(200, Math.max(1, Number(q.pageSize ?? 25)));
  const offset = (page - 1) * pageSize;
  const active =
    q.active === "1" ? 1 :
    q.active === "0" ? 0 :
    null;

  const search = (q.search ?? "").trim();
  return { page, pageSize, offset, active, search };
}

/* =========================
   CFOP
========================= */

export async function listCfop(q: ListQuery) {
  const pool = await getPool();
  const { page, pageSize, offset, active, search } = parsePaging(q);

  const res = await pool.request()
    .input("offset", offset)
    .input("pageSize", pageSize)
    .input("active", active)
    .input("search", `%${search}%`)
    .query(`
      ;WITH base AS (
        SELECT
          id, code, description, nature, active, created_at, updated_at
        FROM dbo.fiscal_cfop
        WHERE (@active IS NULL OR active = @active)
          AND (
            @search = '%%'
            OR code LIKE @search
            OR description LIKE @search
          )
      )
      SELECT
        (SELECT COUNT(1) FROM base) AS total,
        (SELECT
           id, code, description, nature, active, created_at, updated_at
         FROM base
         ORDER BY code
         OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
         FOR JSON PATH) AS itemsJson;
    `);

  const row = res.recordset?.[0] ?? { total: 0, itemsJson: "[]" };
  const items = JSON.parse(row.itemsJson ?? "[]");
  return { page, pageSize, total: Number(row.total ?? 0), items };
}

export async function createCfop(data: CfopCreate) {
  const pool = await getPool();
  const res = await pool.request()
    .input("code", data.code)
    .input("description", data.description)
    .input("nature", data.nature)
    .input("active", data.active ? 1 : 0)
    .query(`
      INSERT INTO dbo.fiscal_cfop (code, description, nature, active)
      OUTPUT INSERTED.*
      VALUES (@code, @description, @nature, @active);
    `);
  return res.recordset?.[0] ?? null;
}

export async function updateCfop(id: number, patch: CfopUpdate) {
  const pool = await getPool();
  const res = await pool.request()
    .input("id", id)
    .input("code", patch.code ?? null)
    .input("description", patch.description ?? null)
    .input("nature", patch.nature ?? null)
    .input("active", patch.active === undefined ? null : (patch.active ? 1 : 0))
    .query(`
      UPDATE dbo.fiscal_cfop
      SET
        code        = COALESCE(@code, code),
        description = COALESCE(@description, description),
        nature      = COALESCE(@nature, nature),
        active      = COALESCE(@active, active),
        updated_at  = sysutcdatetime()
      OUTPUT INSERTED.*
      WHERE id = @id;
    `);
  return res.recordset?.[0] ?? null;
}

export async function toggleCfop(id: number) {
  const pool = await getPool();
  const res = await pool.request()
    .input("id", id)
    .query(`
      UPDATE dbo.fiscal_cfop
      SET active = IIF(active = 1, 0, 1),
          updated_at = sysutcdatetime()
      OUTPUT INSERTED.*
      WHERE id = @id;
    `);
  return res.recordset?.[0] ?? null;
}

export async function upsertCfopMany(items: CfopCreate[], dryRun: boolean) {
  const pool = await getPool();
  if (!items.length) return { inserted: 0, updated: 0 };

  const json = JSON.stringify(items);

  // =========================
  // DRY RUN
  // =========================
  if (dryRun) {
    const res = await pool.request()
      .input("json", json)
      .query(`
        DECLARE @src TABLE (
          code char(4) NOT NULL,
          description nvarchar(500) NOT NULL,
          nature tinyint NULL,
          active bit NOT NULL
        );

        ;INSERT INTO @src(code, description, nature, active)
        SELECT
          code,
          description,
          nature,
          active
        FROM OPENJSON(@json)
        WITH (
          code char(4) '$.code',
          description nvarchar(500) '$.description',
          nature tinyint '$.nature',
          active bit '$.active'
        );

        SELECT
          SUM(CASE WHEN t.id IS NULL THEN 1 ELSE 0 END) AS toInsert,
          SUM(CASE WHEN t.id IS NOT NULL THEN 1 ELSE 0 END) AS toUpdate
        FROM @src s
        LEFT JOIN dbo.fiscal_cfop t
          ON t.code = s.code;
      `);

    const row = res.recordset?.[0] ?? { toInsert: 0, toUpdate: 0 };
    return { inserted: Number(row.toInsert ?? 0), updated: Number(row.toUpdate ?? 0) };
  }

  // =========================
  // REAL UPSERT
  // =========================
  const res = await pool.request()
    .input("json", json)
    .query(`
      DECLARE @src TABLE (
        code char(4) NOT NULL,
        description nvarchar(500) NOT NULL,
        nature tinyint NULL,
        active bit NOT NULL
      );

      ;INSERT INTO @src(code, description, nature, active)
      SELECT
        code,
        description,
        nature,
        active
      FROM OPENJSON(@json)
      WITH (
        code char(4) '$.code',
        description nvarchar(500) '$.description',
        nature tinyint '$.nature',
        active bit '$.active'
      );

      DECLARE @out TABLE(action nvarchar(10));

      MERGE dbo.fiscal_cfop AS tgt
      USING @src AS src
        ON tgt.code = src.code
      WHEN MATCHED THEN
        UPDATE SET
          description = src.description,
          nature = src.nature,
          active = src.active,
          updated_at = sysutcdatetime()
      WHEN NOT MATCHED THEN
        INSERT (code, description, nature, active, created_at, updated_at)
        VALUES (src.code, src.description, src.nature, src.active, sysutcdatetime(), sysutcdatetime())
      OUTPUT $action INTO @out(action);

      SELECT
        SUM(CASE WHEN action = 'INSERT' THEN 1 ELSE 0 END) AS inserted,
        SUM(CASE WHEN action = 'UPDATE' THEN 1 ELSE 0 END) AS updated
      FROM @out;
    `);

  const row = res.recordset?.[0] ?? { inserted: 0, updated: 0 };
  return { inserted: Number(row.inserted ?? 0), updated: Number(row.updated ?? 0) };
}

/* =========================
   NCM
========================= */

export async function listNcm(q: ListQuery) {
  const pool = await getPool();
  const { page, pageSize, offset, active, search } = parsePaging(q);

  const res = await pool.request()
    .input("offset", offset)
    .input("pageSize", pageSize)
    .input("active", active)
    .input("search", `%${search}%`)
    .query(`
      ;WITH base AS (
        SELECT
          id, code, description, ex, start_date, end_date, active, created_at, updated_at
        FROM dbo.fiscal_ncm
        WHERE (@active IS NULL OR active = @active)
          AND (
            @search = '%%'
            OR code LIKE @search
            OR description LIKE @search
          )
      )
      SELECT
        (SELECT COUNT(1) FROM base) AS total,
        (SELECT
           id, code, description, ex, start_date, end_date, active, created_at, updated_at
         FROM base
         ORDER BY code
         OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
         FOR JSON PATH) AS itemsJson;
    `);

  const row = res.recordset?.[0] ?? { total: 0, itemsJson: "[]" };
  const items = JSON.parse(row.itemsJson ?? "[]");
  return { page, pageSize, total: Number(row.total ?? 0), items };
}

export async function createNcm(data: NcmCreate) {
  const pool = await getPool();
  const res = await pool.request()
    .input("code", data.code)
    .input("description", data.description)
    .input("ex", data.ex)
    .input("start_date", data.start_date)
    .input("end_date", data.end_date)
    .input("active", data.active ? 1 : 0)
    .query(`
      INSERT INTO dbo.fiscal_ncm (code, description, ex, start_date, end_date, active)
      OUTPUT INSERTED.*
      VALUES (@code, @description, @ex, @start_date, @end_date, @active);
    `);
  return res.recordset?.[0] ?? null;
}

export async function updateNcm(id: number, patch: NcmUpdate) {
  const pool = await getPool();
  const res = await pool.request()
    .input("id", id)
    .input("code", patch.code ?? null)
    .input("description", patch.description ?? null)
    .input("ex", patch.ex ?? null)
    .input("start_date", patch.start_date ?? null)
    .input("end_date", patch.end_date ?? null)
    .input("active", patch.active === undefined ? null : (patch.active ? 1 : 0))
    .query(`
      UPDATE dbo.fiscal_ncm
      SET
        code        = COALESCE(@code, code),
        description = COALESCE(@description, description),
        ex          = COALESCE(@ex, ex),
        start_date  = COALESCE(@start_date, start_date),
        end_date    = COALESCE(@end_date, end_date),
        active      = COALESCE(@active, active),
        updated_at  = sysutcdatetime()
      OUTPUT INSERTED.*
      WHERE id = @id;
    `);
  return res.recordset?.[0] ?? null;
}

export async function toggleNcm(id: number) {
  const pool = await getPool();
  const res = await pool.request()
    .input("id", id)
    .query(`
      UPDATE dbo.fiscal_ncm
      SET active = IIF(active = 1, 0, 1),
          updated_at = sysutcdatetime()
      OUTPUT INSERTED.*
      WHERE id = @id;
    `);
  return res.recordset?.[0] ?? null;
}

export async function upsertNcmMany(items: NcmCreate[], dryRun: boolean) {
  const pool = await getPool();
  if (!items.length) return { inserted: 0, updated: 0 };

  const json = JSON.stringify(items);

  // =========================
  // DRY RUN
  // =========================
  if (dryRun) {
    const res = await pool.request()
      .input("json", json)
      .query(`
        DECLARE @src TABLE (
          code char(8) NOT NULL,
          description nvarchar(600) NOT NULL,
          ex nvarchar(10) NULL,
          ex_key nvarchar(10) NOT NULL,
          start_date date NULL,
          end_date date NULL,
          active bit NOT NULL
        );

        ;INSERT INTO @src(code, description, ex, ex_key, start_date, end_date, active)
        SELECT
          code,
          description,
          ex,
          ISNULL(NULLIF(LTRIM(RTRIM(ex)), ''), '_') AS ex_key,
          TRY_CONVERT(date, start_date),
          TRY_CONVERT(date, end_date),
          active
        FROM OPENJSON(@json)
        WITH (
          code char(8) '$.code',
          description nvarchar(600) '$.description',
          ex nvarchar(10) '$.ex',
          start_date nvarchar(30) '$.start_date',
          end_date nvarchar(30) '$.end_date',
          active bit '$.active'
        );

        SELECT
          SUM(CASE WHEN t.id IS NULL THEN 1 ELSE 0 END) AS toInsert,
          SUM(CASE WHEN t.id IS NOT NULL THEN 1 ELSE 0 END) AS toUpdate
        FROM @src s
        LEFT JOIN dbo.fiscal_ncm t
          ON t.code = s.code
         AND t.ex_key = s.ex_key;
      `);

    const row = res.recordset?.[0] ?? { toInsert: 0, toUpdate: 0 };
    return { inserted: Number(row.toInsert ?? 0), updated: Number(row.toUpdate ?? 0) };
  }

  // =========================
  // REAL UPSERT
  // =========================
  const res = await pool.request()
    .input("json", json)
    .query(`
      DECLARE @src TABLE (
        code char(8) NOT NULL,
        description nvarchar(600) NOT NULL,
        ex nvarchar(10) NULL,
        ex_key nvarchar(10) NOT NULL,
        start_date date NULL,
        end_date date NULL,
        active bit NOT NULL
      );

      ;INSERT INTO @src(code, description, ex, ex_key, start_date, end_date, active)
      SELECT
        code,
        description,
        ex,
        ISNULL(NULLIF(LTRIM(RTRIM(ex)), ''), '_') AS ex_key,
        TRY_CONVERT(date, start_date),
        TRY_CONVERT(date, end_date),
        active
      FROM OPENJSON(@json)
      WITH (
        code char(8) '$.code',
        description nvarchar(600) '$.description',
        ex nvarchar(10) '$.ex',
        start_date nvarchar(30) '$.start_date',
        end_date nvarchar(30) '$.end_date',
        active bit '$.active'
      );

      DECLARE @out TABLE(action nvarchar(10));

      MERGE dbo.fiscal_ncm AS tgt
      USING @src AS src
        ON tgt.code = src.code
       AND tgt.ex_key = src.ex_key
      WHEN MATCHED THEN
        UPDATE SET
          description = src.description,
          ex = src.ex,
          start_date = src.start_date,
          end_date = src.end_date,
          active = src.active,
          updated_at = sysutcdatetime()
      WHEN NOT MATCHED THEN
        INSERT (code, description, ex, start_date, end_date, active, created_at, updated_at)
        VALUES (src.code, src.description, src.ex, src.start_date, src.end_date, src.active, sysutcdatetime(), sysutcdatetime())
      OUTPUT $action INTO @out(action);

      SELECT
        SUM(CASE WHEN action = 'INSERT' THEN 1 ELSE 0 END) AS inserted,
        SUM(CASE WHEN action = 'UPDATE' THEN 1 ELSE 0 END) AS updated
      FROM @out;
    `);

  const row = res.recordset?.[0] ?? { inserted: 0, updated: 0 };
  return { inserted: Number(row.inserted ?? 0), updated: Number(row.updated ?? 0) };
}