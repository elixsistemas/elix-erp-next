import * as repo from "./companies.repository";
import type { CompanyCreate, CompanyUpdate } from "./companies.schema";

export async function list() {
  return repo.listCompanies();
}

export async function get(id: number) {
  return repo.getCompany(id);
}

export async function create(data: CompanyCreate) {
  return repo.createCompany(data);
}

export async function update(id: number, data: CompanyUpdate) {
  return repo.updateCompany(id, data);
}

export async function remove(id: number) {
  return repo.deleteCompany(id);
}
