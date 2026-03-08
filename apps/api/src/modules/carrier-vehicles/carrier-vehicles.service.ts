import * as repo from "./carrier-vehicles.repository";

type CarrierVehiclePayload = {
  carrierId?: number;

  plate?: string | null;
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

function nullable(value?: string | null) {
  const v = value?.trim();
  return v ? v : null;
}

function normalizePlate(value?: string | null) {
  const v = value?.trim().toUpperCase().replace(/\s+/g, "");
  return v ? v : null;
}

function normalizeUf(value?: string | null) {
  const v = value?.trim().toUpperCase();
  return v ? v : null;
}

export async function list(
  companyId: number,
  query: { q?: string; active?: "1" | "0"; carrierId?: number },
) {
  return repo.listCarrierVehicles({
    companyId,
    q: query.q,
    carrierId: query.carrierId,
    active: query.active === "1" ? true : query.active === "0" ? false : undefined,
  });
}

export async function get(companyId: number, id: number) {
  return repo.getCarrierVehicle(companyId, id);
}

export async function create(companyId: number, data: CarrierVehiclePayload) {
  const plate = normalizePlate(data.plate);

  if (!data.carrierId) {
    return { error: "INVALID_CARRIER" as const };
  }

  const carrierExists = await repo.carrierExists(companyId, data.carrierId);
  if (!carrierExists) {
    return { error: "CARRIER_NOT_FOUND" as const };
  }

  if (!plate) {
    return { error: "INVALID_PLATE" as const };
  }

  const exists = await repo.existsCarrierVehicleByPlate(companyId, plate);
  if (exists) {
    return { error: "PLATE_ALREADY_EXISTS" as const };
  }

  const created = await repo.createCarrierVehicle({
    companyId,
    carrierId: data.carrierId,
    plate,
    secondaryPlate: normalizePlate(data.secondaryPlate),
    renavam: nullable(data.renavam),
    state: normalizeUf(data.state),
    vehicleType: nullable(data.vehicleType),
    bodyType: nullable(data.bodyType),
    brandModel: nullable(data.brandModel),
    capacityKg: data.capacityKg ?? null,
    capacityM3: data.capacityM3 ?? null,
    taraKg: data.taraKg ?? null,
    rntrc: nullable(data.rntrc),
    notes: nullable(data.notes),
    active: data.active ?? true,
  });

  return { data: created };
}

export async function update(companyId: number, id: number, data: CarrierVehiclePayload) {
  const plate =
    "plate" in data ? normalizePlate(data.plate) ?? undefined : undefined;

  if ("carrierId" in data && data.carrierId != null) {
    const carrierExists = await repo.carrierExists(companyId, data.carrierId);
    if (!carrierExists) {
      return { error: "CARRIER_NOT_FOUND" as const };
    }
  }

  if ("plate" in data && !plate) {
    return { error: "INVALID_PLATE" as const };
  }

  if (plate) {
    const exists = await repo.existsCarrierVehicleByPlate(companyId, plate, id);
    if (exists) {
      return { error: "PLATE_ALREADY_EXISTS" as const };
    }
  }

  const updated = await repo.updateCarrierVehicle({
    companyId,
    id,
    carrierId: "carrierId" in data ? data.carrierId : undefined,
    plate,
    secondaryPlate:
      "secondaryPlate" in data ? normalizePlate(data.secondaryPlate) : undefined,
    renavam: "renavam" in data ? nullable(data.renavam) : undefined,
    state: "state" in data ? normalizeUf(data.state) : undefined,
    vehicleType: "vehicleType" in data ? nullable(data.vehicleType) : undefined,
    bodyType: "bodyType" in data ? nullable(data.bodyType) : undefined,
    brandModel: "brandModel" in data ? nullable(data.brandModel) : undefined,
    capacityKg: "capacityKg" in data ? (data.capacityKg ?? null) : undefined,
    capacityM3: "capacityM3" in data ? (data.capacityM3 ?? null) : undefined,
    taraKg: "taraKg" in data ? (data.taraKg ?? null) : undefined,
    rntrc: "rntrc" in data ? nullable(data.rntrc) : undefined,
    notes: "notes" in data ? nullable(data.notes) : undefined,
    active: data.active,
  });

  return { data: updated };
}

export async function remove(companyId: number, id: number) {
  return repo.removeCarrierVehicle(companyId, id);
}