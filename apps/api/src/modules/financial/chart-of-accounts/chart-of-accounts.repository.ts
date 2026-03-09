import sql from "mssql";
import { getPool } from "@/config/db";
import type {
  ChartAccountKind,
  ChartAccountListQuery,
  ChartAccountNature,
  CreateChartAccountInput,
  UpdateChartAccountInput,
} from "./chart-of-accounts.schemas";

export type ChartAccountRow = {
  id: number;
  company_id: number;
  parent_id: number | null;
  code: string;
  name: string;
  nature: ChartAccountNature;
  account_kind: ChartAccountKind;
  allow_posting: boolean;
  is_result_account: boolean;
  dre_group: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function applyListFilters(
  request: sql.Request,
  query?: ChartAccountListQuery,
): string {
  const where: string[] = ["company_id = @companyId"];

  if (query?.search) {
    request.input("search", sql.NVarChar(200), `%${query.search}%`);
    where.push("(code LIKE @search OR name LIKE @search)");
  }

  if (query?.parentId !== undefined) {
    request.input("parentId", sql.Int, query.parentId);
    where.push("parent_id = @parentId");
  }

  if (query?.nature) {
    request.input("nature", sql.NVarChar(20), query.nature);
    where.push("nature = @nature");
  }

  if (query?.accountKind) {
    request.input("accountKind", sql.NVarChar(20), query.accountKind);
    where.push("account_kind = @accountKind");
  }

  if (query?.active !== undefined) {
    const active =
      query.active === "true" || query.active === "1" ? 1 : 0;
    request.input("active", sql.Bit, active);
    where.push("active = @active");
  }

  return where.join(" AND ");
}

export async function listChartAccounts(
  companyId: number,
  query?: ChartAccountListQuery,
) {
  const pool = await getPool();
  const request = pool.request().input("companyId", sql.Int, companyId);

  const where = applyListFilters(request, query);

  const result = await request.query<ChartAccountRow>(`
    SELECT
      id,
      company_id,
      parent_id,
      code,
      name,
      nature,
      account_kind,
      allow_posting,
      is_result_account,
      dre_group,
      active,
      sort_order,
      created_at,
      updated_at
    FROM dbo.chart_of_accounts
    WHERE ${where}
    ORDER BY code, sort_order, name
  `);

  return result.recordset;
}

export async function getChartAccountById(companyId: number, id: number) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("companyId", sql.Int, companyId)
    .input("id", sql.Int, id)
    .query<ChartAccountRow>(`
      SELECT
        id,
        company_id,
        parent_id,
        code,
        name,
        nature,
        account_kind,
        allow_posting,
        is_result_account,
        dre_group,
        active,
        sort_order,
        created_at,
        updated_at
      FROM dbo.chart_of_accounts
      WHERE company_id = @companyId
        AND id = @id
    `);

  return result.recordset[0] ?? null;
}

export async function getChartAccountByCode(companyId: number, code: string) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("companyId", sql.Int, companyId)
    .input("code", sql.NVarChar(30), code)
    .query<ChartAccountRow>(`
      SELECT TOP 1
        id,
        company_id,
        parent_id,
        code,
        name,
        nature,
        account_kind,
        allow_posting,
        is_result_account,
        dre_group,
        active,
        sort_order,
        created_at,
        updated_at
      FROM dbo.chart_of_accounts
      WHERE company_id = @companyId
        AND code = @code
    `);

  return result.recordset[0] ?? null;
}

export async function createChartAccount(
  companyId: number,
  input: CreateChartAccountInput,
) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("companyId", sql.Int, companyId)
    .input("parentId", sql.Int, input.parentId ?? null)
    .input("code", sql.NVarChar(30), input.code)
    .input("name", sql.NVarChar(200), input.name)
    .input("nature", sql.NVarChar(20), input.nature)
    .input("accountKind", sql.NVarChar(20), input.accountKind)
    .input("allowPosting", sql.Bit, input.allowPosting ?? true)
    .input("isResultAccount", sql.Bit, input.isResultAccount ?? false)
    .input("dreGroup", sql.NVarChar(50), input.dreGroup ?? null)
    .input("active", sql.Bit, input.active ?? true)
    .input("sortOrder", sql.Int, input.sortOrder ?? 0)
    .query<{ id: number }>(`
      INSERT INTO dbo.chart_of_accounts (
        company_id,
        parent_id,
        code,
        name,
        nature,
        account_kind,
        allow_posting,
        is_result_account,
        dre_group,
        active,
        sort_order,
        created_at,
        updated_at
      )
      OUTPUT INSERTED.id
      VALUES (
        @companyId,
        @parentId,
        @code,
        @name,
        @nature,
        @accountKind,
        @allowPosting,
        @isResultAccount,
        @dreGroup,
        @active,
        @sortOrder,
        SYSUTCDATETIME(),
        SYSUTCDATETIME()
      )
    `);

  return result.recordset[0]?.id ?? null;
}

export async function updateChartAccount(
  companyId: number,
  id: number,
  input: UpdateChartAccountInput,
) {
  const pool = await getPool();

  const current = await getChartAccountById(companyId, id);
  if (!current) return null;

  await pool
    .request()
    .input("companyId", sql.Int, companyId)
    .input("id", sql.Int, id)
    .input("parentId", sql.Int, input.parentId ?? current.parent_id)
    .input("code", sql.NVarChar(30), input.code ?? current.code)
    .input("name", sql.NVarChar(200), input.name ?? current.name)
    .input("nature", sql.NVarChar(20), input.nature ?? current.nature)
    .input(
      "accountKind",
      sql.NVarChar(20),
      input.accountKind ?? current.account_kind,
    )
    .input(
      "allowPosting",
      sql.Bit,
      input.allowPosting ?? current.allow_posting,
    )
    .input(
      "isResultAccount",
      sql.Bit,
      input.isResultAccount ?? current.is_result_account,
    )
    .input(
      "dreGroup",
      sql.NVarChar(50),
      input.dreGroup === undefined ? current.dre_group : input.dreGroup,
    )
    .input("active", sql.Bit, input.active ?? current.active)
    .input("sortOrder", sql.Int, input.sortOrder ?? current.sort_order)
    .query(`
      UPDATE dbo.chart_of_accounts
      SET
        parent_id = @parentId,
        code = @code,
        name = @name,
        nature = @nature,
        account_kind = @accountKind,
        allow_posting = @allowPosting,
        is_result_account = @isResultAccount,
        dre_group = @dreGroup,
        active = @active,
        sort_order = @sortOrder,
        updated_at = SYSUTCDATETIME()
      WHERE company_id = @companyId
        AND id = @id
    `);

  return getChartAccountById(companyId, id);
}

export async function updateChartAccountStatus(
  companyId: number,
  id: number,
  active: boolean,
) {
  const pool = await getPool();
  await pool
    .request()
    .input("companyId", sql.Int, companyId)
    .input("id", sql.Int, id)
    .input("active", sql.Bit, active)
    .query(`
      UPDATE dbo.chart_of_accounts
      SET
        active = @active,
        updated_at = SYSUTCDATETIME()
      WHERE company_id = @companyId
        AND id = @id
    `);

  return getChartAccountById(companyId, id);
}

export async function deleteChartAccount(companyId: number, id: number) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("companyId", sql.Int, companyId)
    .input("id", sql.Int, id)
    .query(`
      DELETE FROM dbo.chart_of_accounts
      WHERE company_id = @companyId
        AND id = @id
    `);

  return result.rowsAffected[0] ?? 0;
}

export async function countChildren(companyId: number, id: number) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("companyId", sql.Int, companyId)
    .input("id", sql.Int, id)
    .query<{ total: number }>(`
      SELECT COUNT(*) AS total
      FROM dbo.chart_of_accounts
      WHERE company_id = @companyId
        AND parent_id = @id
    `);

  return Number(result.recordset[0]?.total ?? 0);
}

export async function existsInSubtree(
  companyId: number,
  accountId: number,
  possibleParentId: number,
) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("companyId", sql.Int, companyId)
    .input("accountId", sql.Int, accountId)
    .input("possibleParentId", sql.Int, possibleParentId)
    .query<{ found: number }>(`
      ;WITH tree AS (
        SELECT id, parent_id
        FROM dbo.chart_of_accounts
        WHERE company_id = @companyId
          AND id = @accountId

        UNION ALL

        SELECT c.id, c.parent_id
        FROM dbo.chart_of_accounts c
        INNER JOIN tree t
          ON c.parent_id = t.id
        WHERE c.company_id = @companyId
      )
      SELECT TOP 1 1 AS found
      FROM tree
      WHERE id = @possibleParentId
    `);

  return !!result.recordset[0]?.found;
}

export async function listChartAccountsTree(companyId: number) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("companyId", sql.Int, companyId)
    .query<ChartAccountRow>(`
      SELECT
        id,
        company_id,
        parent_id,
        code,
        name,
        nature,
        account_kind,
        allow_posting,
        is_result_account,
        dre_group,
        active,
        sort_order,
        created_at,
        updated_at
      FROM dbo.chart_of_accounts
      WHERE company_id = @companyId
      ORDER BY code, sort_order, name
    `);

  return result.recordset;
}