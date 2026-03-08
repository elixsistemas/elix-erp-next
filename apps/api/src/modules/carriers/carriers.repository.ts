import { getPool } from "../../config/db";

type ListArgs = {
  companyId: number;
  q?: string;
  active?: boolean;
};

type CreateArgs = {
  companyId: number;
  code?: string | null;

  legalName: string;
  tradeName?: string | null;

  documentType: "CPF" | "CNPJ";
  documentNumber: string;

  stateRegistration?: string | null;
  municipalRegistration?: string | null;
  rntrc?: string | null;

  email?: string | null;
  phone?: string | null;
  contactName?: string | null;

  zipCode?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;

  notes?: string | null;
  active?: boolean;
};

type UpdateArgs = Partial<CreateArgs> & {
  companyId: number;
  id: number;
};

export async function listCarriers(args: ListArgs) {
  const pool = await getPool();
  const req = pool.request().input("company_id", args.companyId);

  const where: string[] = ["company_id=@company_id"];

  if (typeof args.active === "boolean") {
    req.input("active", args.active ? 1 : 0);
    where.push("active=@active");
  }

  if (args.q?.trim()) {
    req.input("q", `%${args.q.trim()}%`);
    where.push(`
      (
        legal_name LIKE @q OR
        trade_name LIKE @q OR
        document_number LIKE @q OR
        email LIKE @q OR
        phone LIKE @q OR
        city LIKE @q OR
        state LIKE @q OR
        rntrc LIKE @q OR
        code LIKE @q
      )
    `);
  }

  const sql = `
    SELECT
      id,
      company_id,
      code,
      legal_name,
      trade_name,
      document_type,
      document_number,
      state_registration,
      municipal_registration,
      rntrc,
      email,
      phone,
      contact_name,
      zip_code,
      street,
      number,
      complement,
      district,
      city,
      state,
      notes,
      active,
      created_at,
      updated_at
    FROM dbo.carriers
    WHERE ${where.join(" AND ")}
    ORDER BY active DESC, legal_name ASC, id DESC
  `;

  const r = await req.query(sql);
  return r.recordset;
}

export async function getCarrier(companyId: number, id: number) {
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
        legal_name,
        trade_name,
        document_type,
        document_number,
        state_registration,
        municipal_registration,
        rntrc,
        email,
        phone,
        contact_name,
        zip_code,
        street,
        number,
        complement,
        district,
        city,
        state,
        notes,
        active,
        created_at,
        updated_at
      FROM dbo.carriers
      WHERE company_id=@company_id AND id=@id
    `);

  return r.recordset[0] ?? null;
}

export async function createCarrier(args: CreateArgs) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", args.companyId)
    .input("code", args.code ?? null)
    .input("legal_name", args.legalName)
    .input("trade_name", args.tradeName ?? null)
    .input("document_type", args.documentType)
    .input("document_number", args.documentNumber)
    .input("state_registration", args.stateRegistration ?? null)
    .input("municipal_registration", args.municipalRegistration ?? null)
    .input("rntrc", args.rntrc ?? null)
    .input("email", args.email ?? null)
    .input("phone", args.phone ?? null)
    .input("contact_name", args.contactName ?? null)
    .input("zip_code", args.zipCode ?? null)
    .input("street", args.street ?? null)
    .input("number", args.number ?? null)
    .input("complement", args.complement ?? null)
    .input("district", args.district ?? null)
    .input("city", args.city ?? null)
    .input("state", args.state ?? null)
    .input("notes", args.notes ?? null)
    .input("active", args.active ?? true ? 1 : 0)
    .query(`
      INSERT INTO dbo.carriers (
        company_id,
        code,
        legal_name,
        trade_name,
        document_type,
        document_number,
        state_registration,
        municipal_registration,
        rntrc,
        email,
        phone,
        contact_name,
        zip_code,
        street,
        number,
        complement,
        district,
        city,
        state,
        notes,
        active
      )
      OUTPUT INSERTED.*
      VALUES (
        @company_id,
        @code,
        @legal_name,
        @trade_name,
        @document_type,
        @document_number,
        @state_registration,
        @municipal_registration,
        @rntrc,
        @email,
        @phone,
        @contact_name,
        @zip_code,
        @street,
        @number,
        @complement,
        @district,
        @city,
        @state,
        @notes,
        @active
      )
    `);

  return r.recordset[0] ?? null;
}

export async function updateCarrier(args: UpdateArgs) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", args.companyId)
    .input("id", args.id)
    .input("code", args.code)
    .input("legal_name", args.legalName)
    .input("trade_name", args.tradeName)
    .input("document_type", args.documentType)
    .input("document_number", args.documentNumber)
    .input("state_registration", args.stateRegistration)
    .input("municipal_registration", args.municipalRegistration)
    .input("rntrc", args.rntrc)
    .input("email", args.email)
    .input("phone", args.phone)
    .input("contact_name", args.contactName)
    .input("zip_code", args.zipCode)
    .input("street", args.street)
    .input("number", args.number)
    .input("complement", args.complement)
    .input("district", args.district)
    .input("city", args.city)
    .input("state", args.state)
    .input("notes", args.notes)
    .input("active", typeof args.active === "boolean" ? (args.active ? 1 : 0) : undefined)
    .query(`
      UPDATE dbo.carriers
      SET
        code = COALESCE(@code, code),
        legal_name = COALESCE(@legal_name, legal_name),
        trade_name = COALESCE(@trade_name, trade_name),
        document_type = COALESCE(@document_type, document_type),
        document_number = COALESCE(@document_number, document_number),
        state_registration = COALESCE(@state_registration, state_registration),
        municipal_registration = COALESCE(@municipal_registration, municipal_registration),
        rntrc = COALESCE(@rntrc, rntrc),
        email = COALESCE(@email, email),
        phone = COALESCE(@phone, phone),
        contact_name = COALESCE(@contact_name, contact_name),
        zip_code = COALESCE(@zip_code, zip_code),
        street = COALESCE(@street, street),
        number = COALESCE(@number, number),
        complement = COALESCE(@complement, complement),
        district = COALESCE(@district, district),
        city = COALESCE(@city, city),
        state = COALESCE(@state, state),
        notes = COALESCE(@notes, notes),
        active = COALESCE(@active, active),
        updated_at = SYSUTCDATETIME()
      OUTPUT INSERTED.*
      WHERE company_id=@company_id AND id=@id
    `);

  return r.recordset[0] ?? null;
}

export async function existsCarrierByDocument(companyId: number, documentNumber: string, ignoreId?: number) {
  const pool = await getPool();
  const req = pool
    .request()
    .input("company_id", companyId)
    .input("document_number", documentNumber);

  let sql = `
    SELECT TOP 1 id
    FROM dbo.carriers
    WHERE company_id=@company_id
      AND document_number=@document_number
  `;

  if (ignoreId) {
    req.input("ignore_id", ignoreId);
    sql += ` AND id <> @ignore_id`;
  }

  const r = await req.query(sql);
  return !!r.recordset[0];
}

export async function removeCarrier(companyId: number, id: number) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      DELETE FROM dbo.carriers
      WHERE company_id=@company_id AND id=@id
    `);

  return r.rowsAffected[0] > 0;
}