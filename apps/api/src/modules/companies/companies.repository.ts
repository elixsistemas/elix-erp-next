import { getPool } from "../../config/db";
import type { CompanyCreate, CompanyUpdate } from "./companies.schema";

export type Company = {
  id: number;
  name: string;
  cnpj: string | null;
  created_at: string;
};

export async function listCompanies(companyId: number): Promise<Company[]> {
  const pool = await getPool();
  const result = await pool.request().input("id", companyId).query(`
    SELECT id, name, cnpj, created_at
    FROM companies
    WHERE id = @id
  `);
  return result.recordset as Company[];
}

export async function getCompany(companyId: number): Promise<Company | null> {
  const pool = await getPool();
  const result = await pool.request().input("id", companyId).query(`
    SELECT id, name, cnpj, created_at
    FROM companies
    WHERE id = @id
  `);
  return (result.recordset[0] as Company) ?? null;
}

export async function createCompany(data: CompanyCreate): Promise<Company> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("name", data.name)
    .input("cnpj", data.cnpj ?? null)
    .query(`
      INSERT INTO companies (name, cnpj)
      OUTPUT INSERTED.id, INSERTED.name, INSERTED.cnpj, INSERTED.created_at
      VALUES (@name, @cnpj)
    `);
  return result.recordset[0] as Company;
}

export async function updateCompany(companyId: number, data: CompanyUpdate): Promise<Company | null> {
  const pool = await getPool();

  const current = await getCompany(companyId);
  if (!current) return null;

  const name = data.name ?? current.name;
  const cnpj = (data.cnpj ?? current.cnpj) ?? null;

  const result = await pool
    .request()
    .input("id", companyId)
    .input("name", name)
    .input("cnpj", cnpj)
    .query(`
      UPDATE companies
      SET name=@name, cnpj=@cnpj
      OUTPUT INSERTED.id, INSERTED.name, INSERTED.cnpj, INSERTED.created_at
      WHERE id=@id
    `);

  return (result.recordset[0] as Company) ?? null;
}

export async function deleteCompany(id: number): Promise<boolean> {
  const pool = await getPool();
  const result = await pool.request().input("id", id).query(`
    DELETE FROM companies WHERE id=@id
  `);
  return (result.rowsAffected?.[0] ?? 0) > 0;
}
