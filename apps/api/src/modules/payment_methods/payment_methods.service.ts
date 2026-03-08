import * as repo from "./payment_methods.repository";
import type {
  PaymentMethodCreate,
  PaymentMethodUpdate,
} from "./payment_methods.schema";

export async function list(companyId: number, active?: boolean) {
  const rows = await repo.listPaymentMethods(companyId, active);
  return rows.map(mapRow);
}

export async function get(companyId: number, id: number) {
  const row = await repo.getPaymentMethod(companyId, id);
  return row ? mapRow(row) : null;
}

export async function create(companyId: number, data: PaymentMethodCreate) {
  const created = await repo.createPaymentMethod({
    companyId,
    code: data.code ?? null,
    name: data.name,
    type: data.type,
    description: data.description ?? null,
    active: data.active ?? true,
    allowsInstallments: data.allowsInstallments ?? false,
    maxInstallments: data.maxInstallments ?? 1,
    requiresBankAccount: data.requiresBankAccount ?? false,
    settlementDays: data.settlementDays ?? 0,
    feePercent: data.feePercent ?? 0,
    feeFixed: data.feeFixed ?? 0,
    integrationType: data.integrationType ?? "none",
    externalCode: data.externalCode ?? null,
    isDefault: data.isDefault ?? false,
    sortOrder: data.sortOrder ?? 0,
  });

  return created ? mapRow(created) : null;
}

export async function update(
  companyId: number,
  id: number,
  data: PaymentMethodUpdate,
) {
  const updated = await repo.updatePaymentMethod({
    companyId,
    id,
    code: data.code ?? null,
    name: data.name ?? null,
    type: data.type ?? null,
    description: data.description ?? null,
    active: data.active,
    allowsInstallments: data.allowsInstallments,
    maxInstallments: data.maxInstallments,
    requiresBankAccount: data.requiresBankAccount,
    settlementDays: data.settlementDays,
    feePercent: data.feePercent,
    feeFixed: data.feeFixed,
    integrationType: data.integrationType ?? null,
    externalCode: data.externalCode ?? null,
    isDefault: data.isDefault,
    sortOrder: data.sortOrder,
  });

  return updated ? mapRow(updated) : null;
}

export function desativar(companyId: number, id: number) {
  return repo.deactivatePaymentMethod(companyId, id);
}

export function activate(companyId: number, id: number) {
  return repo.activatePaymentMethod(companyId, id);
}

function mapRow(row: any) {
  return {
    ...row,
    fee_percent: Number(row.fee_percent ?? 0),
    fee_fixed: Number(row.fee_fixed ?? 0),
  };
}