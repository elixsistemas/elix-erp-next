// apps/api/src/modules/company_modules/company_modules.repository.ts
import sql from "mssql";
import { getPool } from "../../config/db";
import type { CompanyModuleItem } from "./company_modules.schema";

export type DbCompanyModule = { module_key: string; enabled: boolean };

export async function listCompanyModules(companyId: number): Promise<DbCompanyModule[]> {
  const pool = await getPool();
  const res = await pool
    .request()
    .input("company_id", sql.Int, companyId)
    .query(`
      SELECT module_key, CAST(enabled AS bit) AS enabled
      FROM dbo.company_modules
      WHERE company_id = @company_id
      ORDER BY module_key
    `);

  return res.recordset as DbCompanyModule[];
}

export async function upsertCompanyModules(companyId: number, modules: CompanyModuleItem[]) {
  const pool = await getPool();
  const tx = pool.transaction();
  await tx.begin();

  try {
    for (const it of modules) {
      await tx
        .request()
        .input("company_id", sql.Int, companyId)
        .input("module_key", sql.NVarChar(50), it.module_key) // ✅ certo
        .input("enabled", sql.Bit, it.enabled ? 1 : 0)
        .query(`
          MERGE dbo.company_modules AS t
          USING (SELECT @company_id AS company_id, @module_key AS module_key) AS s
          ON t.company_id = s.company_id AND t.module_key = s.module_key
          WHEN MATCHED THEN
            UPDATE SET enabled = @enabled
          WHEN NOT MATCHED THEN
            INSERT (company_id, module_key, enabled)
            VALUES (@company_id, @module_key, @enabled);
        `);
    }

    await tx.commit();
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}