import { getPool } from "../../config/db";

export type PaymentTermRow = {
  id: number;
  company_id: number;
  name: string;
  offsets_json: string;
  active: boolean;
  created_at: string;
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
    SELECT id, company_id, name, offsets_json, active, created_at
    FROM dbo.payment_terms
    ${where}
    ORDER BY active DESC, id DESC
  `);

  return r.recordset as PaymentTermRow[];
}

export async function getPaymentTerm(companyId: number, id: number) {
  const pool = await getPool();
  const r = await pool.request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      SELECT id, company_id, name, offsets_json, active, created_at
      FROM dbo.payment_terms
      WHERE company_id=@company_id AND id=@id
    `);

  return (r.recordset[0] as PaymentTermRow) ?? null;
}

export async function createPaymentTerm(args: {
  companyId: number;
  name: string;
  offsetsJson: string;
  active: boolean;
}) {
  const pool = await getPool();
  const r = await pool.request()
    .input("company_id", args.companyId)
    .input("name", args.name)
    .input("offsets_json", args.offsetsJson)
    .input("active", args.active ? 1 : 0)
    .query(`
      INSERT INTO dbo.payment_terms (company_id, name, offsets_json, active)
      OUTPUT INSERTED.*
      VALUES (@company_id, @name, @offsets_json, @active)
    `);

  return r.recordset[0] ?? null;
}

export async function updatePaymentTerm(args: {
  companyId: number;
  id: number;
  name?: string;
  offsetsJson?: string;
  active?: boolean;
}) {
  const pool = await getPool();
  const r = await pool.request()
    .input("company_id", args.companyId)
    .input("id", args.id)
    .input("name", args.name ?? null)
    .input("offsets_json", args.offsetsJson ?? null)
    .input("active", typeof args.active === "boolean" ? (args.active ? 1 : 0) : null)
    .query(`
      UPDATE dbo.payment_terms
      SET
        name = COALESCE(@name, name),
        offsets_json = COALESCE(@offsets_json, offsets_json),
        active = COALESCE(@active, active)
      OUTPUT INSERTED.*
      WHERE company_id=@company_id AND id=@id
    `);

  return r.recordset[0] ?? null;
}
