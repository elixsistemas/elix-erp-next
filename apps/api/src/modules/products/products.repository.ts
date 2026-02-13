import { getPool } from "../../config/db";
import type { ProductCreate, ProductUpdate } from "./products.schema";

export type Product = {
  id: number;
  name: string;
  sku: string | null;
  ncm: string | null;
  ean: string | null;
  price: number;
  cost: number;
  active: boolean;
  created_at: string;
};

export async function listProducts(companyId: number): Promise<Product[]> {
  const pool = await getPool();
  const result = await pool.request().input("company_id", companyId).query(`
    SELECT id, name, sku, ncm, ean, price, cost, active, created_at
    FROM products
    WHERE company_id = @company_id AND active = 1
    ORDER BY name
  `);
  return result.recordset as Product[];
}

export async function getProduct(companyId: number, id: number): Promise<Product | null> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      SELECT id, name, sku, ncm, ean, price, cost, active, created_at
      FROM products
      WHERE company_id = @company_id AND id = @id
    `);
  return (result.recordset[0] as Product) ?? null;
}

export async function createProduct(companyId: number, data: ProductCreate): Promise<Product> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("name", data.name)
    .input("sku", data.sku ?? null)
    .input("ncm", data.ncm ?? null)
    .input("ean", data.ean ?? null)
    .input("price", data.price)
    .input("cost", data.cost)
    .query(`
      INSERT INTO products (company_id, name, sku, ncm, ean, price, cost)
      OUTPUT INSERTED.id, INSERTED.name, INSERTED.sku, INSERTED.ncm, INSERTED.ean,
             INSERTED.price, INSERTED.cost, INSERTED.active, INSERTED.created_at
      VALUES (@company_id, @name, @sku, @ncm, @ean, @price, @cost)
    `);
  return result.recordset[0] as Product;
}

export async function updateProduct(companyId: number, id: number, data: ProductUpdate): Promise<Product | null> {
  const pool = await getPool();

  // Atualização parcial sem gambiarra: COALESCE
  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .input("name", data.name ?? null)
    .input("sku", data.sku ?? null)
    .input("ncm", data.ncm ?? null)
    .input("ean", data.ean ?? null)
    .input("price", typeof data.price === "number" ? data.price : null)
    .input("cost", typeof data.cost === "number" ? data.cost : null)
    .query(`
      UPDATE products
      SET
        name = COALESCE(@name, name),
        sku  = COALESCE(@sku, sku),
        ncm  = COALESCE(@ncm, ncm),
        ean  = COALESCE(@ean, ean),
        price = COALESCE(@price, price),
        cost  = COALESCE(@cost, cost)
      OUTPUT INSERTED.id, INSERTED.name, INSERTED.sku, INSERTED.ncm, INSERTED.ean,
             INSERTED.price, INSERTED.cost, INSERTED.active, INSERTED.created_at
      WHERE company_id = @company_id AND id = @id
    `);

  return (result.recordset[0] as Product) ?? null;
}

export async function deactivateProduct(companyId: number, id: number): Promise<boolean> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("id", id)
    .query(`
      UPDATE products
      SET active = 0
      WHERE company_id = @company_id AND id = @id
    `);

  return (result.rowsAffected?.[0] ?? 0) > 0;
}

export async function getProductStock(companyId: number, productId: number): Promise<number> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("company_id", companyId)
    .input("product_id", productId)
    .query(`
      SELECT stock
      FROM v_product_stock
      WHERE company_id = @company_id AND product_id = @product_id
    `);

  const row = result.recordset[0] as { stock?: number } | undefined;
  return row?.stock ?? 0;
}
