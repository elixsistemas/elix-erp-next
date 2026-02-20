import * as repo from "./customers.repository";
import type { CustomerCreate, CustomerUpdate, CustomerListQuery } from "./customers.schema";

export function list(args: { companyId: number } & CustomerListQuery) {
  return repo.listCustomers(args);
}

export function get(companyId: number, id: number) {
  return repo.getCustomer(companyId, id);
}

export function create(companyId: number, data: CustomerCreate) {
  // (opcional) aqui você poderia normalizar document (remover máscara)
  // para não mexer em dados antigos, mantive só trim
  const payload: CustomerCreate = { ...data, document: data.document.trim() };
  return repo.createCustomer(companyId, payload);
}

export function update(companyId: number, id: number, data: CustomerUpdate) {
  const payload: CustomerUpdate = {
    ...data,
    document: typeof data.document === "string" ? data.document.trim() : data.document,
  };
  return repo.updateCustomer(companyId, id, payload);
}

export function remove(companyId: number, id: number) {
  return repo.deleteCustomer(companyId, id);
}
