import * as repo from "./carriers.repository";

type CarrierPayload = {
  code?: string | null;
  name?: string;
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

function normalizeDocument(value?: string | null) {
  return value?.replace(/\D/g, "") || null;
}

function normalizeEmail(value?: string | null) {
  const v = value?.trim();
  return v ? v.toLowerCase() : null;
}

function nullable(value?: string | null) {
  const v = value?.trim();
  return v ? v : null;
}

export async function list(companyId: number, query: { q?: string; active?: "1" | "0" }) {
  return repo.listCarriers({
    companyId,
    q: query.q,
    active: query.active === "1" ? true : query.active === "0" ? false : undefined,
  });
}

export async function get(companyId: number, id: number) {
  return repo.getCarrier(companyId, id);
}

export async function create(companyId: number, data: CarrierPayload) {
  const document = normalizeDocument(data.document);

  if (document) {
    const exists = await repo.existsCarrierByDocument(companyId, document);
    if (exists) return { error: "DOCUMENT_ALREADY_EXISTS" as const };
  }

  const created = await repo.createCarrier({
    companyId,
    code: nullable(data.code),
    name: String(data.name ?? "").trim(),
    legalName: nullable(data.legalName),
    document,
    stateRegistration: nullable(data.stateRegistration),
    rntrc: nullable(data.rntrc),

    email: normalizeEmail(data.email),
    phone: nullable(data.phone),
    contactName: nullable(data.contactName),

    zipCode: nullable(data.zipCode),
    street: nullable(data.street),
    streetNumber: nullable(data.streetNumber),
    complement: nullable(data.complement),
    neighborhood: nullable(data.neighborhood),
    city: nullable(data.city),
    state: nullable(data.state)?.toUpperCase() ?? null,

    vehicleType: nullable(data.vehicleType),
    plate: nullable(data.plate)?.toUpperCase() ?? null,

    notes: nullable(data.notes),
    active: data.active ?? true,
  });

  return { data: created };
}

export async function update(companyId: number, id: number, data: CarrierPayload) {
  const document = normalizeDocument(data.document);

  if (document) {
    const exists = await repo.existsCarrierByDocument(companyId, document, id);
    if (exists) return { error: "DOCUMENT_ALREADY_EXISTS" as const };
  }

  const updated = await repo.updateCarrier({
    companyId,
    id,
    code: "code" in data ? nullable(data.code) : undefined,
    name: "name" in data ? String(data.name ?? "").trim() : undefined,
    legalName: "legalName" in data ? nullable(data.legalName) : undefined,
    document: "document" in data ? document : undefined,
    stateRegistration: "stateRegistration" in data ? nullable(data.stateRegistration) : undefined,
    rntrc: "rntrc" in data ? nullable(data.rntrc) : undefined,

    email: "email" in data ? normalizeEmail(data.email) : undefined,
    phone: "phone" in data ? nullable(data.phone) : undefined,
    contactName: "contactName" in data ? nullable(data.contactName) : undefined,

    zipCode: "zipCode" in data ? nullable(data.zipCode) : undefined,
    street: "street" in data ? nullable(data.street) : undefined,
    streetNumber: "streetNumber" in data ? nullable(data.streetNumber) : undefined,
    complement: "complement" in data ? nullable(data.complement) : undefined,
    neighborhood: "neighborhood" in data ? nullable(data.neighborhood) : undefined,
    city: "city" in data ? nullable(data.city) : undefined,
    state: "state" in data ? (nullable(data.state)?.toUpperCase() ?? null) : undefined,

    vehicleType: "vehicleType" in data ? nullable(data.vehicleType) : undefined,
    plate: "plate" in data ? (nullable(data.plate)?.toUpperCase() ?? null) : undefined,

    notes: "notes" in data ? nullable(data.notes) : undefined,
    active: data.active,
  } as any);

  return { data: updated };
}

export async function remove(companyId: number, id: number) {
  return repo.removeCarrier(companyId, id);
}