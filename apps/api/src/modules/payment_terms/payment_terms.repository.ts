import { getPool } from "../../config/db";

export type PaymentTermRow = {
  id: number;
  company_id: number;
  code: string | null;
  name: string;
  description: string | null;
  offsets_json: string;
  active: boolean;
  created_at: string;
  updated_at: string;

  term_type: "cash" | "installment";
  installment_count: number;
  grace_days: number;
  interest_mode: "none" | "fixed" | "percent";
  interest_value: string | number;
  penalty_value: string | number;
  discount_mode: "none" | "fixed" | "percent";
  discount_value: string | number;
  allows_early_payment_discount: boolean;
  is_default: boolean;
  sort_order: number;
};

export async function listPaymentTerms(companyId: number, active?: boolean) {
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
      description,
      offsets_json,
      active,
      created_at,
      updated_at,
      term_type,
      installment_count,
      grace_days,
      interest_mode,
      interest_value,
      penalty_value,
      discount_mode,
      discount_value,
      allows_early_payment_discount,
      is_default,
      sort_order
    FROM dbo.payment_terms
    ${where}
    ORDER BY is_default DESC, active DESC, sort_order ASC, id DESC
  `);

  return r.recordset as PaymentTermRow[];
}

export async function getPaymentTerm(companyId: number, id: number) {
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
        description,
        offsets_json,
        active,
        created_at,
        updated_at,
        term_type,
        installment_count,
        grace_days,
        interest_mode,
        interest_value,
        penalty_value,
        discount_mode,
        discount_value,
        allows_early_payment_discount,
        is_default,
        sort_order
      FROM dbo.payment_terms
      WHERE company_id=@company_id AND id=@id
    `);

  return (r.recordset[0] as PaymentTermRow) ?? null;
}

export async function createPaymentTerm(args: {
  companyId: number;
  code?: string | null;
  name: string;
  description?: string | null;
  offsetsJson: string;
  active: boolean;
  termType: "cash" | "installment";
  installmentCount: number;
  graceDays: number;
  interestMode: "none" | "fixed" | "percent";
  interestValue: number;
  penaltyValue: number;
  discountMode: "none" | "fixed" | "percent";
  discountValue: number;
  allowsEarlyPaymentDiscount: boolean;
  isDefault: boolean;
  sortOrder: number;
}) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", args.companyId)
    .input("code", args.code ?? null)
    .input("name", args.name)
    .input("description", args.description ?? null)
    .input("offsets_json", args.offsetsJson)
    .input("active", args.active ? 1 : 0)
    .input("term_type", args.termType)
    .input("installment_count", args.installmentCount)
    .input("grace_days", args.graceDays)
    .input("interest_mode", args.interestMode)
    .input("interest_value", args.interestValue)
    .input("penalty_value", args.penaltyValue)
    .input("discount_mode", args.discountMode)
    .input("discount_value", args.discountValue)
    .input(
      "allows_early_payment_discount",
      args.allowsEarlyPaymentDiscount ? 1 : 0,
    )
    .input("is_default", args.isDefault ? 1 : 0)
    .input("sort_order", args.sortOrder)
    .query(`
      INSERT INTO dbo.payment_terms (
        company_id,
        code,
        name,
        description,
        offsets_json,
        active,
        term_type,
        installment_count,
        grace_days,
        interest_mode,
        interest_value,
        penalty_value,
        discount_mode,
        discount_value,
        allows_early_payment_discount,
        is_default,
        sort_order
      )
      OUTPUT INSERTED.*
      VALUES (
        @company_id,
        @code,
        @name,
        @description,
        @offsets_json,
        @active,
        @term_type,
        @installment_count,
        @grace_days,
        @interest_mode,
        @interest_value,
        @penalty_value,
        @discount_mode,
        @discount_value,
        @allows_early_payment_discount,
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

export async function updatePaymentTerm(args: {
  companyId: number;
  id: number;
  code?: string | null;
  name?: string;
  description?: string | null;
  offsetsJson?: string;
  active?: boolean;
  termType?: "cash" | "installment";
  installmentCount?: number;
  graceDays?: number;
  interestMode?: "none" | "fixed" | "percent";
  interestValue?: number;
  penaltyValue?: number;
  discountMode?: "none" | "fixed" | "percent";
  discountValue?: number;
  allowsEarlyPaymentDiscount?: boolean;
  isDefault?: boolean;
  sortOrder?: number;
}) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", args.companyId)
    .input("id", args.id)
    .input("code", args.code ?? null)
    .input("name", args.name ?? null)
    .input("description", args.description ?? null)
    .input("offsets_json", args.offsetsJson ?? null)
    .input("active", typeof args.active === "boolean" ? (args.active ? 1 : 0) : null)
    .input("term_type", args.termType ?? null)
    .input("installment_count", args.installmentCount ?? null)
    .input("grace_days", args.graceDays ?? null)
    .input("interest_mode", args.interestMode ?? null)
    .input("interest_value", typeof args.interestValue === "number" ? args.interestValue : null)
    .input("penalty_value", typeof args.penaltyValue === "number" ? args.penaltyValue : null)
    .input("discount_mode", args.discountMode ?? null)
    .input("discount_value", typeof args.discountValue === "number" ? args.discountValue : null)
    .input(
      "allows_early_payment_discount",
      typeof args.allowsEarlyPaymentDiscount === "boolean"
        ? (args.allowsEarlyPaymentDiscount ? 1 : 0)
        : null,
    )
    .input("is_default", typeof args.isDefault === "boolean" ? (args.isDefault ? 1 : 0) : null)
    .input("sort_order", typeof args.sortOrder === "number" ? args.sortOrder : null)
    .query(`
      UPDATE dbo.payment_terms
      SET
        code = COALESCE(@code, code),
        name = COALESCE(@name, name),
        description = COALESCE(@description, description),
        offsets_json = COALESCE(@offsets_json, offsets_json),
        active = COALESCE(@active, active),
        term_type = COALESCE(@term_type, term_type),
        installment_count = COALESCE(@installment_count, installment_count),
        grace_days = COALESCE(@grace_days, grace_days),
        interest_mode = COALESCE(@interest_mode, interest_mode),
        interest_value = COALESCE(@interest_value, interest_value),
        penalty_value = COALESCE(@penalty_value, penalty_value),
        discount_mode = COALESCE(@discount_mode, discount_mode),
        discount_value = COALESCE(@discount_value, discount_value),
        allows_early_payment_discount = COALESCE(@allows_early_payment_discount, allows_early_payment_discount),
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

async function enforceSingleDefault(companyId: number, keepId: number) {
  const pool = await getPool();

  await pool
    .request()
    .input("company_id", companyId)
    .input("keep_id", keepId)
    .query(`
      UPDATE dbo.payment_terms
      SET
        is_default = 0,
        updated_at = SYSUTCDATETIME()
      WHERE company_id=@company_id
        AND id <> @keep_id
        AND is_default = 1
    `);
}