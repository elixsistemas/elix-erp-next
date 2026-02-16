import type { FastifyInstance } from "fastify";
import { authRoutes } from "./modules/auth/auth.routes";
import { companiesRoutes } from "./modules/companies/companies.routes";
import { customersRoutes } from "./modules/customers/customers.routes";
import { productsRoutes } from "./modules/products/products.routes";
import { quotesRoutes } from "./modules/quotes/quotes.routes";
import { salesRoutes } from "./modules/sales/sales.routes";
import { inventoryRoutes } from "./modules/inventory/inventory.routes";
import { inventoryMovementsRoutes } from "./modules/inventory_movements/inventory_movements.routes";
import { bankAccountsRoutes } from "./modules/bank_accounts/bank_accounts.routes";
import { receivablesRoutes } from "./modules/receivables/receivables.routes";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes";
import { brandingRoutes } from "./modules/branding/branding.routes";
import { bankBalanceEventsRoutes } from "./modules/bank_balance_events/bank_balance_events.routes";



export async function routes(app: FastifyInstance) {
  await app.register(authRoutes);
  await app.register(companiesRoutes);
  await app.register(customersRoutes);
  await app.register(productsRoutes);
  await app.register(quotesRoutes);
  await app.register(salesRoutes);
  await app.register(inventoryRoutes, { prefix: "/inventory" });
  await app.register(inventoryMovementsRoutes, { prefix: "/inventory" });
  await app.register(bankAccountsRoutes);
  await app.register(receivablesRoutes);
  await app.register(dashboardRoutes);
  await app.register(brandingRoutes);
  await app.register(bankBalanceEventsRoutes);
}