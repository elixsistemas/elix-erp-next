import { z } from "zod";
import * as repo from "./payment_terms.repository";
import type { PaymentTermCreate, PaymentTermUpdate } from "./payment_terms.schema";

const OffsetsSchema = z.array(z.number().int().min(0)).min(1);

export function parseOffsets(offsetsJson: string): number[] {
  // offsets_json vem como string JSON: "[30,60]"
  const parsed = JSON.parse(offsetsJson);
  return OffsetsSchema.parse(parsed);
}

export async function list(companyId: number, active?: boolean) {
  const rows = await repo.listPaymentTerms(companyId, active);
  return rows.map((r) => ({
    ...r,
    offsets: safeOffsets(r.offsets_json)
  }));
}

export async function get(companyId: number, id: number) {
  const row = await repo.getPaymentTerm(companyId, id);
  if (!row) return null;

  return {
    ...row,
    offsets: safeOffsets(row.offsets_json)
  };
}

export async function create(companyId: number, data: PaymentTermCreate) {
  const offsetsJson = JSON.stringify(data.offsets);
  const created = await repo.createPaymentTerm({
    companyId,
    name: data.name,
    offsetsJson,
    active: data.active ?? true
  });

  return created ? { ...created, offsets: safeOffsets(created.offsets_json) } : null;
}

export async function update(companyId: number, id: number, data: PaymentTermUpdate) {
  const offsetsJson = data.offsets ? JSON.stringify(data.offsets) : undefined;

  const updated = await repo.updatePaymentTerm({
    companyId,
    id,
    name: data.name,
    offsetsJson,
    active: data.active
  });

  return updated ? { ...updated, offsets: safeOffsets(updated.offsets_json) } : null;
}

function safeOffsets(offsetsJson: string) {
  try {
    return parseOffsets(offsetsJson);
  } catch {
    return [];
  }
}

export async function getPaymentTermOffsets(companyId: number, id: number) {
  const row = await repo.getPaymentTerm(companyId, id);
  if (!row) throw new Error("PAYMENT_TERM_NOT_FOUND");
  if (!row.active) throw new Error("PAYMENT_TERM_INACTIVE");

  return parseOffsets(row.offsets_json);
}