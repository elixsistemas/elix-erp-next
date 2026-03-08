import * as repo from "./carriers.repository";

type CarrierPayload = {
  code?: string | null;
  legalName?: string;
  tradeName?: string | null;

  documentType?: "CPF" | "CNPJ";
  documentNumber?: string;

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
  const documentNumber = normalizeDocument(data.documentNumber);

  if (!data.documentType || !documentNumber) {
    return { error: "INVALID_DOCUMENT" as const };
  }

  const exists = await repo.existsCarrierByDocument(companyId, documentNumber);
  if (exists) return { error: "DOCUMENT_ALREADY_EXISTS" as const };

  const created = await repo.createCarrier({
    companyId,
    code: nullable(data.code),

    legalName: String(data.legalName ?? "").trim(),
    tradeName: nullable(data.tradeName),

    documentType: data.documentType,
    documentNumber,

    stateRegistration: nullable(data.stateRegistration),
    municipalRegistration: nullable(data.municipalRegistration),
    rntrc: nullable(data.rntrc),

    email: normalizeEmail(data.email),
    phone: nullable(data.phone),
    contactName: nullable(data.contactName),

    zipCode: nullable(data.zipCode),
    street: nullable(data.street),
    number: nullable(data.number),
    complement: nullable(data.complement),
    district: nullable(data.district),
    city: nullable(data.city),
    state: nullable(data.state)?.toUpperCase() ?? null,

    notes: nullable(data.notes),
    active: data.active ?? true,
  });

  return { data: created };
}

export async function update(companyId: number, id: number, data: CarrierPayload) {
  const documentNumber =
    "documentNumber" in data ? normalizeDocument(data.documentNumber) : undefined;

  if (documentNumber) {
    const exists = await repo.existsCarrierByDocument(companyId, documentNumber, id);
    if (exists) return { error: "DOCUMENT_ALREADY_EXISTS" as const };
  }

  const updated = await repo.updateCarrier({
    companyId,
    id,

    code: "code" in data ? nullable(data.code) : undefined,

    legalName: "legalName" in data ? String(data.legalName ?? "").trim() : undefined,
    tradeName: "tradeName" in data ? nullable(data.tradeName) : undefined,

    documentType: "documentType" in data ? data.documentType : undefined,
    documentNumber: "documentNumber" in data
    ? normalizeDocument(data.documentNumber) ?? undefined
    : undefined,

    stateRegistration: "stateRegistration" in data ? nullable(data.stateRegistration) : undefined,
    municipalRegistration:
      "municipalRegistration" in data ? nullable(data.municipalRegistration) : undefined,
    rntrc: "rntrc" in data ? nullable(data.rntrc) : undefined,

    email: "email" in data ? normalizeEmail(data.email) : undefined,
    phone: "phone" in data ? nullable(data.phone) : undefined,
    contactName: "contactName" in data ? nullable(data.contactName) : undefined,

    zipCode: "zipCode" in data ? nullable(data.zipCode) : undefined,
    street: "street" in data ? nullable(data.street) : undefined,
    number: "number" in data ? nullable(data.number) : undefined,
    complement: "complement" in data ? nullable(data.complement) : undefined,
    district: "district" in data ? nullable(data.district) : undefined,
    city: "city" in data ? nullable(data.city) : undefined,
    state: "state" in data ? (nullable(data.state)?.toUpperCase() ?? null) : undefined,

    notes: "notes" in data ? nullable(data.notes) : undefined,
    active: data.active,
  });

  return { data: updated };
}

export async function remove(companyId: number, id: number) {
  return repo.removeCarrier(companyId, id);
}