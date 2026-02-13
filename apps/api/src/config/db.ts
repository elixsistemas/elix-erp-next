import sql from "mssql";
import { env } from "./env";

const config: sql.config = {
  user: env.DB_USER,
  password: env.DB_PASS,
  server: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  options: {
    encrypt: env.DB_ENCRYPT,
    trustServerCertificate: true
  }
};

let pool: sql.ConnectionPool | null = null;

export async function getPool() {
  if (pool) return pool;
  pool = await sql.connect(config);
  return pool;
}
