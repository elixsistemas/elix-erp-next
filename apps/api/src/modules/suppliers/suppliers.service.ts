import type { SupplierCreate, SupplierListQuery, SupplierUpdate } from "./suppliers.schema";
import * as repo from "./suppliers.repository";

function digitsOnly(v?: string | null) {
  if (!v) return v;
  return String(v).replace(/\D/g, "");
}

export async function list(companyId: number, q: SupplierListQuery) {
  return repo.listSuppliers(companyId, q);
}

export async function get(companyId: number, id: number) {
  return repo.getSupplier(companyId, id);
}

export async function create(companyId: number, args: SupplierCreate) {
  // normaliza para evitar duplicidade com máscara
  const payload: SupplierCreate = {
    ...args,
    document: digitsOnly(args.document) as string,
    phone: digitsOnly(args.phone ?? null) ?? null,
    mobile: digitsOnly(args.mobile ?? null) ?? null,
    billing_zip_code: digitsOnly(args.billing_zip_code ?? null) ?? null,
    shipping_zip_code: digitsOnly(args.shipping_zip_code ?? null) ?? null,
  };

  return repo.createSupplier(companyId, payload);
}

export async function update(companyId: number, id: number, args: SupplierUpdate) {
  const payload: SupplierUpdate = {
    ...args,

    document:
      typeof args.document !== "undefined"
        ? (digitsOnly(args.document) || undefined)
        : undefined,

    phone:
      typeof args.phone !== "undefined"
        ? (digitsOnly(args.phone ?? null) || null) // aqui pode ser null se você quiser limpar
        : undefined,

    mobile:
      typeof args.mobile !== "undefined"
        ? (digitsOnly(args.mobile ?? null) || null)
        : undefined,

    billing_zip_code:
      typeof args.billing_zip_code !== "undefined"
        ? (digitsOnly(args.billing_zip_code ?? null) || null)
        : undefined,

    shipping_zip_code:
      typeof args.shipping_zip_code !== "undefined"
        ? (digitsOnly(args.shipping_zip_code ?? null) || null)
        : undefined,
  };

  return repo.updateSupplier(companyId, id, payload);
}

export async function remove(companyId: number, id: number) {
  return repo.removeSupplier(companyId, id);
}
