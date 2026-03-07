import sql from "mssql";
import { getPool } from "../../config/db";

export type DbCompanyModuleCatalogItem = {
  id: number;
  module_key: string;
  domain: string | null;
  label: string | null;
  description: string | null;
  sort_order: number | null;
  active: boolean;
  enabled: boolean;
};

export type DbCompanyModuleEnabled = {
  module_key: string;
  enabled: boolean;
};

export async function listCatalogWithCompanyState(
  companyId: number
): Promise<DbCompanyModuleCatalogItem[]> {
  const pool = await getPool();

  const res = await pool
    .request()
    .input("company_id", sql.Int, companyId)
    .query(`
      SELECT
        mc.id,
        mc.module_key,
        mc.domain,
        mc.label,
        mc.description,
        mc.sort_order,
        CAST(mc.active AS bit) AS active,
        CAST(ISNULL(cm.enabled, 0) AS bit) AS enabled
      FROM dbo.modules_catalog mc
      LEFT JOIN dbo.company_modules cm
        ON cm.company_id = @company_id
       AND cm.module_key = mc.module_key
      WHERE mc.active = 1
      ORDER BY mc.sort_order, mc.label, mc.module_key
    `);

  return res.recordset as DbCompanyModuleCatalogItem[];
}

export async function listEnabledCompanyModules(
  companyId: number
): Promise<DbCompanyModuleEnabled[]> {
  const pool = await getPool();

  const res = await pool
    .request()
    .input("company_id", sql.Int, companyId)
    .query(`
      SELECT
        cm.module_key,
        CAST(cm.enabled AS bit) AS enabled
      FROM dbo.company_modules cm
      INNER JOIN dbo.modules_catalog mc
        ON mc.module_key = cm.module_key
       AND mc.active = 1
      WHERE cm.company_id = @company_id
        AND cm.enabled = 1
      ORDER BY cm.module_key
    `);

  return res.recordset as DbCompanyModuleEnabled[];
}

export async function listCatalogKeys(): Promise<string[]> {
  const pool = await getPool();

  const res = await pool.request().query(`
    SELECT module_key
    FROM dbo.modules_catalog
    WHERE active = 1
  `);

  return (res.recordset ?? []).map((r: any) => String(r.module_key));
}

export async function upsertCompanyModules(
  companyId: number,
  modules: Array<{ module_key: string; enabled: boolean }>
) {
  const pool = await getPool();
  const tx = pool.transaction();

  await tx.begin();

  try {
    for (const it of modules) {
      await tx
        .request()
        .input("company_id", sql.Int, companyId)
        .input("module_key", sql.VarChar(80), it.module_key)
        .input("enabled", sql.Bit, it.enabled ? 1 : 0)
        .query(`
          MERGE dbo.company_modules AS target
          USING (
            SELECT
              @company_id AS company_id,
              @module_key AS module_key,
              @enabled AS enabled
          ) AS source
          ON target.company_id = source.company_id
         AND target.module_key = source.module_key
          WHEN MATCHED THEN
            UPDATE SET enabled = source.enabled
          WHEN NOT MATCHED THEN
            INSERT (company_id, module_key, enabled)
            VALUES (source.company_id, source.module_key, source.enabled);
        `);
    }

    await tx.commit();
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}