import * as repo from "./customers.repository";
import type { CustomerCreate, CustomerUpdate } from "./customers.schema";

export function list(companyId: number) {
  return repo.listCustomers(companyId);
}

export function create(companyId: number, data: CustomerCreate) {
  return repo.createCustomer(companyId, data);
}

export function update(companyId: number, id: number, data: CustomerUpdate) {
  return repo.updateCustomer(companyId, id, data);
}

export function remove(companyId: number, id: number) {
  return repo.deleteCustomer(companyId, id);
}
