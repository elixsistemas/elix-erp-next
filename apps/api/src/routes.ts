import type { FastifyInstance } from "fastify";
import { authRoutes } from "./modules/auth/auth.routes";
import { companiesRoutes } from "./modules/companies/companies.routes";
import { customersRoutes } from "./modules/customers/customers.routes";
import { productsRoutes } from "./modules/products/products.routes";
import { inventoryRoutes } from "./modules/inventory/inventory.routes";
import { quotesRoutes } from "./modules/quotes/quotes.routes";
import { salesRoutes } from "./modules/sales/sales.routes";


export async function routes(app: FastifyInstance) {
  await app.register(authRoutes);
  await app.register(companiesRoutes);
  await app.register(customersRoutes);
  await app.register(productsRoutes);
  await app.register(inventoryRoutes);
  await app.register(quotesRoutes);
  await app.register(salesRoutes);
}