// apps/api/src/modules/fiscal/engine/fiscal-engine.repository.ts
import sql from "mssql";
import { getPool } from "../../../config/db";

// 1) checa se já existe snapshot
export async function hasFiscalSnapshotTx(
  tx: sql.Transaction,
  companyId: number,
  sourceType: "sale" | "order",
  sourceId: number,
  engineVersion: string
) {
  const { recordset } = await new sql.Request(tx)
    .input("company_id", sql.Int, companyId)
    .input("source_type", sql.NVarChar(20), sourceType)
    .input("source_id", sql.Int, sourceId)
    .input("engine_version", sql.NVarChar(20), engineVersion)
    .query(`
      SELECT TOP 1 id
      FROM dbo.fiscal_calculations
      WHERE company_id=@company_id
        AND source_type=@source_type
        AND source_id=@source_id
        AND engine_version=@engine_version
    `);

  return Boolean(recordset[0]);
}

export async function getCompanyUF(companyId: number, tx?: sql.Transaction) {
  const pool = tx ? null : await getPool();
  const req = tx ? new sql.Request(tx) : (pool as sql.ConnectionPool).request();

  const { recordset } = await req
    .input("company_id", sql.Int, companyId)
    .query(`SELECT TOP 1 state FROM dbo.companies WHERE id = @company_id AND deleted_at IS NULL`);

  return (recordset[0]?.state as string) ?? null;
}

export async function getCustomerDestUF(companyId: number, customerId: number, tx?: sql.Transaction) {
  const pool = tx ? null : await getPool();
  const req = tx ? new sql.Request(tx) : (pool as sql.ConnectionPool).request();

  const { recordset } = await req
    .input("company_id", sql.Int, companyId)
    .input("customer_id", sql.Int, customerId)
    .query(`
      SELECT TOP 1
        NULLIF(LTRIM(RTRIM(shipping_state)), '') AS shipping_state,
        NULLIF(LTRIM(RTRIM(billing_state)), '')  AS billing_state
      FROM dbo.customers
      WHERE company_id = @company_id AND id = @customer_id AND deleted_at IS NULL
    `);

  const r = recordset[0];
  return (r?.shipping_state || r?.billing_state || null) as string | null;
}

export async function getActiveCompanyTaxProfile(companyId: number, tx?: sql.Transaction) {
  const pool = tx ? null : await getPool();
  const req = tx ? new sql.Request(tx) : (pool as sql.ConnectionPool).request();

  const { recordset } = await req
    .input("company_id", sql.Int, companyId)
    .query(`
      SELECT TOP 1 crt, icms_contributor
      FROM dbo.company_tax_profiles
      WHERE company_id = @company_id AND end_date IS NULL
      ORDER BY start_date DESC, id DESC
    `);

  const r = recordset[0];
  return r
    ? { crt: Number(r.crt) as 1 | 2 | 3, icmsContributor: Boolean(r.icms_contributor) }
    : null;
}

export async function upsertFiscalCalculation(
  companyId: number,
  sourceType: "order" | "sale",
  sourceId: number,
  engineVersion: string,
  contextJson: string,
  resultJson: string,
  tx: sql.Transaction
) {
  await new sql.Request(tx)
    .input("company_id", sql.Int, companyId)
    .input("source_type", sql.NVarChar(20), sourceType)
    .input("source_id", sql.Int, sourceId)
    .input("engine_version", sql.NVarChar(20), engineVersion)
    .input("context_json", sql.NVarChar(sql.MAX), contextJson)
    .input("result_json", sql.NVarChar(sql.MAX), resultJson)
    .query(`
      MERGE dbo.fiscal_calculations AS t
      USING (SELECT
        @company_id AS company_id,
        @source_type AS source_type,
        @source_id AS source_id,
        @engine_version AS engine_version
      ) AS s
      ON t.company_id = s.company_id
     AND t.source_type = s.source_type
     AND t.source_id = s.source_id
     AND t.engine_version = s.engine_version
      WHEN MATCHED THEN
        UPDATE SET
          context_json = @context_json,
          result_json  = @result_json,
          created_at   = SYSUTCDATETIME()
      WHEN NOT MATCHED THEN
        INSERT (company_id, source_type, source_id, engine_version, context_json, result_json, created_at)
        VALUES (@company_id, @source_type, @source_id, @engine_version, @context_json, @result_json, SYSUTCDATETIME());
    `);
}