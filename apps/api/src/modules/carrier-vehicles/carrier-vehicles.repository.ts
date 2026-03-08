import { getPool } from "../../config/db";

type ListArgs = {
  companyId: number;
  q?: string;
  active?: boolean;
  carrierId?: number;
};

type CreateArgs = {
  companyId: number;
  carrierId: number;

  plate: string;
  secondaryPlate?: string | null;

  renavam?: string | null;
  state?: string | null;

  vehicleType?: string | null;
  bodyType?: string | null;
  brandModel?: string | null;

  capacityKg?: number | null;
  capacityM3?: number | null;
  taraKg?: number | null;

  rntrc?: string | null;
  notes?: string | null;

  active?: boolean;
};

type UpdateArgs = Partial<CreateArgs> & {
  companyId: number;
  id: number;
};

export async function listCarrierVehicles(args: ListArgs) {
  const pool = await getPool();
  const req = pool.request().input("company_id", args.companyId);

  const where: string[] = ["cv.company_id=@company_id"];

  if (typeof args.active === "boolean") {
    req.input("active", args.active ? 1 : 0);
    where.push("cv.active=@active");
  }

  if (args.carrierId) {
    req.input("carrier_id", args.carrierId);
    where.push("cv.carrier_id=@carrier_id");
  }

  if (args.q?.trim()) {
    req.input("q", `%${args.q.trim()}%`);
    where.push(`
      (
        cv.plate LIKE @q OR
        cv.secondary_plate LIKE @q OR
        cv.renavam LIKE @q OR
        cv.vehicle_type LIKE @q OR
        cv.body_type LIKE @q OR
        cv.brand_model LIKE @q OR
        cv.state LIKE @q OR
        cv.rntrc LIKE @q OR
        c.legal_name LIKE @q OR
        c.trade_name LIKE @q
      )
    `);
  }

  const sql = `
    SELECT
      cv.id,
      cv.company_id,
      cv.carrier_id,
      c.legal_name AS carrier_legal_name,
      c.trade_name AS carrier_trade_name,
      cv.plate,
      cv.secondary_plate,
      cv.renavam,
      cv.state,
      cv.vehicle_type,
      cv.body_type,
      cv.brand_model,
      cv.capacity_kg,
      cv.capacity_m3,
      cv.tara_kg,
      cv.rntrc,
      cv.notes,
      cv.active,
      cv.created_at,
      cv.updated_at
    FROM dbo.carrier_vehicles cv
    INNER JOIN dbo.carriers c
      ON c.id = cv.carrier_id
     AND c.company_id = cv.company_id
    WHERE ${where.join(" AND ")}
    ORDER BY cv.active DESC, cv.plate ASC, cv.id DESC
  `;

  const r = await req.query(sql);
  return r.recordset;
}

export async function getCarrierVehicle(companyId: number, id: number) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      SELECT
        cv.id,
        cv.company_id,
        cv.carrier_id,
        c.legal_name AS carrier_legal_name,
        c.trade_name AS carrier_trade_name,
        cv.plate,
        cv.secondary_plate,
        cv.renavam,
        cv.state,
        cv.vehicle_type,
        cv.body_type,
        cv.brand_model,
        cv.capacity_kg,
        cv.capacity_m3,
        cv.tara_kg,
        cv.rntrc,
        cv.notes,
        cv.active,
        cv.created_at,
        cv.updated_at
      FROM dbo.carrier_vehicles cv
      INNER JOIN dbo.carriers c
        ON c.id = cv.carrier_id
       AND c.company_id = cv.company_id
      WHERE cv.company_id=@company_id
        AND cv.id=@id
    `);

  return r.recordset[0] ?? null;
}

export async function createCarrierVehicle(args: CreateArgs) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", args.companyId)
    .input("carrier_id", args.carrierId)
    .input("plate", args.plate)
    .input("secondary_plate", args.secondaryPlate ?? null)
    .input("renavam", args.renavam ?? null)
    .input("state", args.state ?? null)
    .input("vehicle_type", args.vehicleType ?? null)
    .input("body_type", args.bodyType ?? null)
    .input("brand_model", args.brandModel ?? null)
    .input("capacity_kg", args.capacityKg ?? null)
    .input("capacity_m3", args.capacityM3 ?? null)
    .input("tara_kg", args.taraKg ?? null)
    .input("rntrc", args.rntrc ?? null)
    .input("notes", args.notes ?? null)
    .input("active", args.active ?? true ? 1 : 0)
    .query(`
      INSERT INTO dbo.carrier_vehicles (
        company_id,
        carrier_id,
        plate,
        secondary_plate,
        renavam,
        state,
        vehicle_type,
        body_type,
        brand_model,
        capacity_kg,
        capacity_m3,
        tara_kg,
        rntrc,
        notes,
        active
      )
      OUTPUT INSERTED.*
      VALUES (
        @company_id,
        @carrier_id,
        @plate,
        @secondary_plate,
        @renavam,
        @state,
        @vehicle_type,
        @body_type,
        @brand_model,
        @capacity_kg,
        @capacity_m3,
        @tara_kg,
        @rntrc,
        @notes,
        @active
      )
    `);

  return r.recordset[0] ?? null;
}

export async function updateCarrierVehicle(args: UpdateArgs) {
  const pool = await getPool();

  const sets: string[] = ["updated_at = SYSUTCDATETIME()"];
  const req = pool
    .request()
    .input("company_id", args.companyId)
    .input("id", args.id);

  if ("carrierId" in args) {
    req.input("carrier_id", args.carrierId ?? null);
    sets.push("carrier_id = @carrier_id");
  }

  if ("plate" in args) {
    req.input("plate", args.plate ?? null);
    sets.push("plate = @plate");
  }

  if ("secondaryPlate" in args) {
    req.input("secondary_plate", args.secondaryPlate ?? null);
    sets.push("secondary_plate = @secondary_plate");
  }

  if ("renavam" in args) {
    req.input("renavam", args.renavam ?? null);
    sets.push("renavam = @renavam");
  }

  if ("state" in args) {
    req.input("state", args.state ?? null);
    sets.push("state = @state");
  }

  if ("vehicleType" in args) {
    req.input("vehicle_type", args.vehicleType ?? null);
    sets.push("vehicle_type = @vehicle_type");
  }

  if ("bodyType" in args) {
    req.input("body_type", args.bodyType ?? null);
    sets.push("body_type = @body_type");
  }

  if ("brandModel" in args) {
    req.input("brand_model", args.brandModel ?? null);
    sets.push("brand_model = @brand_model");
  }

  if ("capacityKg" in args) {
    req.input("capacity_kg", args.capacityKg ?? null);
    sets.push("capacity_kg = @capacity_kg");
  }

  if ("capacityM3" in args) {
    req.input("capacity_m3", args.capacityM3 ?? null);
    sets.push("capacity_m3 = @capacity_m3");
  }

  if ("taraKg" in args) {
    req.input("tara_kg", args.taraKg ?? null);
    sets.push("tara_kg = @tara_kg");
  }

  if ("rntrc" in args) {
    req.input("rntrc", args.rntrc ?? null);
    sets.push("rntrc = @rntrc");
  }

  if ("notes" in args) {
    req.input("notes", args.notes ?? null);
    sets.push("notes = @notes");
  }

  if (typeof args.active === "boolean") {
    req.input("active", args.active ? 1 : 0);
    sets.push("active = @active");
  }

  const sql = `
    UPDATE dbo.carrier_vehicles
    SET ${sets.join(", ")}
    OUTPUT INSERTED.*
    WHERE company_id=@company_id AND id=@id
  `;

  const r = await req.query(sql);
  return r.recordset[0] ?? null;
}

export async function existsCarrierVehicleByPlate(
  companyId: number,
  plate: string,
  ignoreId?: number,
) {
  const pool = await getPool();
  const req = pool
    .request()
    .input("company_id", companyId)
    .input("plate", plate);

  let sql = `
    SELECT TOP 1 id
    FROM dbo.carrier_vehicles
    WHERE company_id=@company_id
      AND plate=@plate
  `;

  if (ignoreId) {
    req.input("ignore_id", ignoreId);
    sql += ` AND id <> @ignore_id`;
  }

  const r = await req.query(sql);
  return !!r.recordset[0];
}

export async function carrierExists(companyId: number, carrierId: number) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("carrier_id", carrierId)
    .query(`
      SELECT TOP 1 id
      FROM dbo.carriers
      WHERE company_id=@company_id
        AND id=@carrier_id
    `);

  return !!r.recordset[0];
}

export async function removeCarrierVehicle(companyId: number, id: number) {
  const pool = await getPool();

  const r = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      DELETE FROM dbo.carrier_vehicles
      WHERE company_id=@company_id AND id=@id
    `);

  return r.rowsAffected[0] > 0;
}