import { z } from "zod";
import * as repo from "./payment_terms.repository";
import type { PaymentTermCreate, PaymentTermUpdate } from "./payment_terms.schema";

const OffsetsSchema = z.array(z.number().int().min(0)).min(1);

export function parseOffsets(offsetsJson: string): number[] {
  const parsed = JSON.parse(offsetsJson);
  return OffsetsSchema.parse(parsed);
}

export async function list(companyId: number, active?: boolean) {
  const rows = await repo.listPaymentTerms(companyId, active);
  return rows.map(mapRow);
}

export async function get(companyId: number, id: number) {
  const row = await repo.getPaymentTerm(companyId, id);
  if (!row) return null;
  return mapRow(row);
}

export async function create(companyId: number, data: PaymentTermCreate) {
  const offsets = data.offsets;
  const offsetsJson = JSON.stringify(offsets);

  const created = await repo.createPaymentTerm({
    companyId,
    code: data.code ?? null,
    name: data.name,
    description: data.description ?? null,
    offsetsJson,
    active: data.active ?? true,
    termType: data.termType ?? inferTermType(offsets),
    installmentCount: offsets.length,
    graceDays: data.graceDays ?? 0,
    interestMode: data.interestMode ?? "none",
    interestValue: data.interestValue ?? 0,
    penaltyValue: data.penaltyValue ?? 0,
    discountMode: data.discountMode ?? "none",
    discountValue: data.discountValue ?? 0,
    allowsEarlyPaymentDiscount: data.allowsEarlyPaymentDiscount ?? false,
    isDefault: data.isDefault ?? false,
    sortOrder: data.sortOrder ?? 0,
  });

  return created ? mapRow(created) : null;
}

export async function update(companyId: number, id: number, data: PaymentTermUpdate) {
  const offsetsJson = data.offsets ? JSON.stringify(data.offsets) : undefined;

  const updated = await repo.updatePaymentTerm({
    companyId,
    id,
    code: data.code ?? null,
    name: data.name,
    description: data.description ?? null,
    offsetsJson,
    active: data.active,
    termType: data.termType ?? (data.offsets ? inferTermType(data.offsets) : undefined),
    installmentCount: data.offsets ? data.offsets.length : undefined,
    graceDays: data.graceDays,
    interestMode: data.interestMode,
    interestValue: data.interestValue,
    penaltyValue: data.penaltyValue,
    discountMode: data.discountMode,
    discountValue: data.discountValue,
    allowsEarlyPaymentDiscount: data.allowsEarlyPaymentDiscount,
    isDefault: data.isDefault,
    sortOrder: data.sortOrder,
  });

  return updated ? mapRow(updated) : null;
}

function safeOffsets(offsetsJson: string) {
  try {
    return parseOffsets(offsetsJson);
  } catch {
    return [];
  }
}

function inferTermType(offsets: number[]) {
  return offsets.length === 1 && offsets[0] === 0 ? "cash" : "installment";
}

function mapRow(row: any) {
  return {
    ...row,
    offsets: safeOffsets(row.offsets_json),
    interest_value: Number(row.interest_value ?? 0),
    penalty_value: Number(row.penalty_value ?? 0),
    discount_value: Number(row.discount_value ?? 0),
  };
}

export async function getPaymentTermOffsets(companyId: number, id: number) {
  const row = await repo.getPaymentTerm(companyId, id);
  if (!row) throw new Error("PAYMENT_TERM_NOT_FOUND");
  if (!row.active) throw new Error("PAYMENT_TERM_INACTIVE");
  return parseOffsets(row.offsets_json);
}