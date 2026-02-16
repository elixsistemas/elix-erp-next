import { getPool } from "../../config/db";
import type { CustomerCreate, CustomerUpdate } from "./customers.schema";

export async function listCustomers(companyId: number) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("company_id", companyId)
    .query(`
      SELECT id, name, document, email, phone, created_at
      FROM customers
      WHERE company_id = @company_id
      ORDER BY name
    `);

  return result.recordset;
}

export async function createCustomer(companyId: number, data: CustomerCreate) {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("name", data.name)
    .input("document", data.document)
    .input("email", data.email ?? null)
    .input("phone", data.phone ?? null)
    .query(`
      INSERT INTO customers (company_id, name, document, email, phone)
      OUTPUT INSERTED.id, INSERTED.name, INSERTED.document, INSERTED.email, INSERTED.phone, INSERTED.created_at
      VALUES (@company_id, @name, @document, @email, @phone)
    `);

  return result.recordset[0];
}

export async function updateCustomer(
  companyId: number,
  id: number,
  data: CustomerUpdate
) {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .input("name", data.name ?? null)
    .input("document", data.document ?? null)
    .input("email", data.email ?? null)
    .input("phone", data.phone ?? null)
    .query(`
      UPDATE customers
      SET
        name = COALESCE(@name, name),
        document = COALESCE(@document, document),
        email = COALESCE(@email, email),
        phone = COALESCE(@phone, phone)
      OUTPUT INSERTED.id, INSERTED.name, INSERTED.document, INSERTED.email, INSERTED.phone, INSERTED.created_at
      WHERE id = @id AND company_id = @company_id
    `);

  return result.recordset[0] ?? null;
}

export async function deleteCustomer(companyId: number, id: number) {
  const pool = await getPool();

  await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
        UPDATE customers
        SET is_active = 0,
            deleted_at = GETDATE()
        WHERE id = @id AND company_id = @company_id;
    `);
}
