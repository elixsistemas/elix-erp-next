import * as repo from "./companies.repository";
import type { CompanyCreate, CompanyUpdate } from "./companies.schema";

export async function list(companyId: number) {
  return repo.listCompanies(companyId);
}

export async function get(companyId: number) {
  return repo.getCompany(companyId);
}

// opcional/admin
export async function create(data: CompanyCreate) {
  // aqui dá para validar CNPJ etc.
  return repo.createCompany(data);
}

export async function update(companyId: number, data: CompanyUpdate) {
  // validação multi-tenant real do default_bank_account_id
  if (data.default_bank_account_id) {
    const ok = await repo.bankAccountBelongsToCompany({
      companyId,
      bankAccountId: data.default_bank_account_id,
    });
    if (!ok) return { error: "BANK_ACCOUNT_INVALID" as const };
  }

  const updated = await repo.updateCompany(companyId, data);
  if (!updated) return { error: "COMPANY_NOT_FOUND" as const };

  return { data: updated };
}

// opcional/admin
export async function remove(id: number) {
  return repo.deleteCompany(id);
}
