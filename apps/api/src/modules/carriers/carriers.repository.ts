import { getPool } from "../../config/db";

type ListArgs = {
  companyId: number;
  q?: string;
  active?: boolean;
};

type CreateArgs = {
  companyId: number;
  code?: string | null;
  name: string;
  legalName?: string | null;
  document?: string | null;
  stateRegistration?: string | null;
  rntrc?: string | null;

  email?: string | null;
  phone?: string | null;
  contactName?: string | null;

  zipCode?: string | null;
  street?: string | null;
  streetNumber?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;

  vehicleType?: string | null;
  plate?: string | null;

  notes?: string | null;
  active?: boolean;
};

type UpdateArgs = CreateArgs & {
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
        name LIKE @q OR
        legal_name LIKE @q OR
        document LIKE @q OR
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
      name,
      legal_name,
      document,
      state_registration,
      rntrc,
      email,
      phone,
      contact_name,
      zip_code,
      street,
      street_number,
      complement,
      neighborhood,
      city,
      state,
      vehicle_type,
      plate,
      notes,
      active,
      created_at,
      updated_at
    FROM dbo.carriers
    WHERE ${where.join(" AND ")}
    ORDER BY active DESC, name ASC, id DESC
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
        name,
        legal_name,
        document,
        state_registration,
        rntrc,
        email,
        phone,
        contact_name,
        zip_code,
        street,
        street_number,
        complement,
        neighborhood,
        city,
        state,
        vehicle_type,
        plate,
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
    .input("name", args.name)
    .input("legal_name", args.legalName ?? null)
    .input("document", args.document ?? null)
    .input("state_registration", args.stateRegistration ?? null)
    .input("rntrc", args.rntrc ?? null)
    .input("email", args.email ?? null)
    .input("phone", args.phone ?? null)
    .input("contact_name", args.contactName ?? null)
    .input("zip_code", args.zipCode ?? null)
    .input("street", args.street ?? null)
    .input("street_number", args.streetNumber ?? null)
    .input("complement", args.complement ?? null)
    .input("neighborhood", args.neighborhood ?? null)
    .input("city", args.city ?? null)
    .input("state", args.state ?? null)
    .input("vehicle_type", args.vehicleType ?? null)
    .input("plate", args.plate ?? null)
    .input("notes", args.notes ?? null)
    .input("active", args.active ?? true ? 1 : 0)
    .query(`
      INSERT INTO dbo.carriers (
        company_id,
        code,
        name,
        legal_name,
        document,
        state_registration,
        rntrc,
        email,
        phone,
        contact_name,
        zip_code,
        street,
        street_number,
        complement,
        neighborhood,
        city,
        state,
        vehicle_type,
        plate,
        notes,
        active
      )
      OUTPUT INSERTED.*
      VALUES (
        @company_id,
        @code,
        @name,
        @legal_name,
        @document,
        @state_registration,
        @rntrc,
        @email,
        @phone,
        @contact_name,
        @zip_code,
        @street,
        @street_number,
        @complement,
        @neighborhood,
        @city,
        @state,
        @vehicle_type,
        @plate,
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
    .input("code", args.code ?? null)
    .input("name", args.name ?? null)
    .input("legal_name", args.legalName ?? null)
    .input("document", args.document ?? null)
    .input("state_registration", args.stateRegistration ?? null)
    .input("rntrc", args.rntrc ?? null)
    .input("email", args.email ?? null)
    .input("phone", args.phone ?? null)
    .input("contact_name", args.contactName ?? null)
    .input("zip_code", args.zipCode ?? null)
    .input("street", args.street ?? null)
    .input("street_number", args.streetNumber ?? null)
    .input("complement", args.complement ?? null)
    .input("neighborhood", args.neighborhood ?? null)
    .input("city", args.city ?? null)
    .input("state", args.state ?? null)
    .input("vehicle_type", args.vehicleType ?? null)
    .input("plate", args.plate ?? null)
    .input("notes", args.notes ?? null)
    .input("active", typeof args.active === "boolean" ? (args.active ? 1 : 0) : null)
    .query(`
      UPDATE dbo.carriers
      SET
        code = @code,
        name = COALESCE(@name, name),
        legal_name = @legal_name,
        document = @document,
        state_registration = @state_registration,
        rntrc = @rntrc,
        email = @email,
        phone = @phone,
        contact_name = @contact_name,
        zip_code = @zip_code,
        street = @street,
        street_number = @street_number,
        complement = @complement,
        neighborhood = @neighborhood,
        city = @city,
        state = @state,
        vehicle_type = @vehicle_type,
        plate = @plate,
        notes = @notes,
        active = COALESCE(@active, active),
        updated_at = SYSUTCDATETIME()
      OUTPUT INSERTED.*
      WHERE company_id=@company_id AND id=@id
    `);

  return r.recordset[0] ?? null;
}

export async function existsCarrierByDocument(companyId: number, document: string, ignoreId?: number) {
  const pool = await getPool();
  const req = pool
    .request()
    .input("company_id", companyId)
    .input("document", document);

  let sql = `
    SELECT TOP 1 id
    FROM dbo.carriers
    WHERE company_id=@company_id
      AND document=@document
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