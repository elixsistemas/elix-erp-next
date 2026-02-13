import { getPool } from "../../config/db";
import type { CompanyCreate, CompanyUpdate } from "./companies.schema";

export type Company = {
  id: number;
  name: string;
  cnpj: string | null;
  created_at: string;
};

export async function listCompanies(): Promise<Company[]> {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT id, name, cnpj, created_at
    FROM companies
    ORDER BY name
  `);
  return result.recordset as Company[];
}

export async function getCompany(id: number): Promise<Company | null> {
  const pool = await getPool();
  const result = await pool.request().input("id", id).query(`
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

export async function updateCompany(id: number, data: CompanyUpdate): Promise<Company | null> {
  const pool = await getPool();

  // update “patch” simples: pega existente e aplica
  const current = await getCompany(id);
  if (!current) return null;

  const name = data.name ?? current.name;
  const cnpj = (data.cnpj ?? current.cnpj) ?? null;

  const result = await pool
    .request()
    .input("id", id)
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
