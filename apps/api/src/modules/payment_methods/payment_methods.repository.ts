import { getPool } from "../../config/db";

export type PaymentMethodRow = {
  id: number;
  company_id: number;
  code: string | null;
  name: string;
  type: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;

  allows_installments: boolean;
  max_installments: number;
  requires_bank_account: boolean;
  settlement_days: number;
  fee_percent: string | number;
  fee_fixed: string | number;
  integration_type: string | null;
  external_code: string | null;
  is_default: boolean;
  sort_order: number;
};

type CreateArgs = {
  companyId: number;
  code?: string | null;
  name: string;
  type: string;
  description?: string | null;
  active: boolean;

  allowsInstallments: boolean;
  maxInstallments: number;
  requiresBankAccount: boolean;
  settlementDays: number;
  feePercent: number;
  feeFixed: number;
  integrationType: string | null;
  externalCode?: string | null;
  isDefault: boolean;
  sortOrder: number;
};

type UpdateArgs = {
  companyId: number;
  id: number;
  code?: string | null;
  name?: string | null;
  type?: string | null;
  description?: string | null;
  active?: boolean;

  allowsInstallments?: boolean;
  maxInstallments?: number;
  requiresBankAccount?: boolean;
  settlementDays?: number;
  feePercent?: number;
  feeFixed?: number;
  integrationType?: string | null;
  externalCode?: string | null;
  isDefault?: boolean;
  sortOrder?: number;
};

export async function listPaymentMethods(companyId: number, active?: boolean) {
  const pool = await getPool();
  const req = pool.request().input("company_id", companyId);

  let where = "WHERE company_id=@company_id";
  if (typeof active === "boolean") {
    req.input("active", active ? 1 : 0);
    where += " AND active=@active";
  }

  const r = await req.query(`
    SELECT
      id,
      company_id,
      code,
      name,
      type,
      description,
      active,
      created_at,
      updated_at,
      allows_installments,
      max_installments,
      requires_bank_account,
      settlement_days,
      fee_percent,
      fee_fixed,
      integration_type,
      external_code,
      is_default,
      sort_order
    FROM dbo.payment_methods
    ${where}
    ORDER BY is_default DESC, active DESC, sort_order ASC, id DESC
  `);

  return r.recordset as PaymentMethodRow[];
}

export async function getPaymentMethod(companyId: number, id: number) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      SELECT
        id,
        company_id,
        code,
        name,
        type,
        description,
        active,
        created_at,
        updated_at,
        allows_installments,
        max_installments,
        requires_bank_account,
        settlement_days,
        fee_percent,
        fee_fixed,
        integration_type,
        external_code,
        is_default,
        sort_order
      FROM dbo.payment_methods
      WHERE company_id=@company_id AND id=@id
    `);

  return (r.recordset[0] as PaymentMethodRow) ?? null;
}

export async function createPaymentMethod(args: CreateArgs) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", args.companyId)
    .input("code", args.code ?? null)
    .input("name", args.name)
    .input("type", args.type)
    .input("description", args.description ?? null)
    .input("active", args.active ? 1 : 0)
    .input("allows_installments", args.allowsInstallments ? 1 : 0)
    .input("max_installments", args.maxInstallments)
    .input("requires_bank_account", args.requiresBankAccount ? 1 : 0)
    .input("settlement_days", args.settlementDays)
    .input("fee_percent", args.feePercent)
    .input("fee_fixed", args.feeFixed)
    .input("integration_type", args.integrationType)
    .input("external_code", args.externalCode ?? null)
    .input("is_default", args.isDefault ? 1 : 0)
    .input("sort_order", args.sortOrder)
    .query(`
      INSERT INTO dbo.payment_methods (
        company_id,
        code,
        name,
        type,
        description,
        active,
        allows_installments,
        max_installments,
        requires_bank_account,
        settlement_days,
        fee_percent,
        fee_fixed,
        integration_type,
        external_code,
        is_default,
        sort_order
      )
      OUTPUT INSERTED.*
      VALUES (
        @company_id,
        @code,
        @name,
        @type,
        @description,
        @active,
        @allows_installments,
        @max_installments,
        @requires_bank_account,
        @settlement_days,
        @fee_percent,
        @fee_fixed,
        @integration_type,
        @external_code,
        @is_default,
        @sort_order
      )
    `);

  const row = r.recordset[0] ?? null;

  if (row && row.is_default) {
    await enforceSingleDefault(args.companyId, row.id);
  }

  return row;
}

export async function updatePaymentMethod(args: UpdateArgs) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", args.companyId)
    .input("id", args.id)
    .input("code", args.code ?? null)
    .input("name", args.name ?? null)
    .input("type", args.type ?? null)
    .input("description", args.description ?? null)
    .input("active", typeof args.active === "boolean" ? (args.active ? 1 : 0) : null)
    .input(
      "allows_installments",
      typeof args.allowsInstallments === "boolean"
        ? (args.allowsInstallments ? 1 : 0)
        : null,
    )
    .input(
      "max_installments",
      typeof args.maxInstallments === "number" ? args.maxInstallments : null,
    )
    .input(
      "requires_bank_account",
      typeof args.requiresBankAccount === "boolean"
        ? (args.requiresBankAccount ? 1 : 0)
        : null,
    )
    .input(
      "settlement_days",
      typeof args.settlementDays === "number" ? args.settlementDays : null,
    )
    .input("fee_percent", typeof args.feePercent === "number" ? args.feePercent : null)
    .input("fee_fixed", typeof args.feeFixed === "number" ? args.feeFixed : null)
    .input("integration_type", args.integrationType ?? null)
    .input("external_code", args.externalCode ?? null)
    .input("is_default", typeof args.isDefault === "boolean" ? (args.isDefault ? 1 : 0) : null)
    .input("sort_order", typeof args.sortOrder === "number" ? args.sortOrder : null)
    .query(`
      UPDATE dbo.payment_methods
      SET
        code = COALESCE(@code, code),
        name = COALESCE(@name, name),
        type = COALESCE(@type, type),
        description = @description,
        active = COALESCE(@active, active),
        allows_installments = COALESCE(@allows_installments, allows_installments),
        max_installments = COALESCE(@max_installments, max_installments),
        requires_bank_account = COALESCE(@requires_bank_account, requires_bank_account),
        settlement_days = COALESCE(@settlement_days, settlement_days),
        fee_percent = COALESCE(@fee_percent, fee_percent),
        fee_fixed = COALESCE(@fee_fixed, fee_fixed),
        integration_type = @integration_type,
        external_code = @external_code,
        is_default = COALESCE(@is_default, is_default),
        sort_order = COALESCE(@sort_order, sort_order),
        updated_at = SYSUTCDATETIME()
      OUTPUT INSERTED.*
      WHERE company_id=@company_id AND id=@id
    `);

  const row = r.recordset[0] ?? null;

  if (row && row.is_default) {
    await enforceSingleDefault(args.companyId, row.id);
  }

  return row;
}

export async function deactivatePaymentMethod(companyId: number, id: number) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      UPDATE dbo.payment_methods
      SET
        active = 0,
        updated_at = SYSUTCDATETIME()
      OUTPUT INSERTED.id, INSERTED.active
      WHERE company_id=@company_id AND id=@id AND active=1
    `);

  return r.recordset[0] ?? null;
}

export async function activatePaymentMethod(companyId: number, id: number) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      UPDATE dbo.payment_methods
      SET
        active = 1,
        updated_at = SYSUTCDATETIME()
      OUTPUT INSERTED.id, INSERTED.active
      WHERE company_id=@company_id AND id=@id AND active=0
    `);

  return r.recordset[0] ?? null;
}

async function enforceSingleDefault(companyId: number, keepId: number) {
  const pool = await getPool();

  await pool
    .request()
    .input("company_id", companyId)
    .input("keep_id", keepId)
    .query(`
      UPDATE dbo.payment_methods
      SET
        is_default = 0,
        updated_at = SYSUTCDATETIME()
      WHERE company_id=@company_id
        AND id <> @keep_id
        AND is_default = 1
    `);
}