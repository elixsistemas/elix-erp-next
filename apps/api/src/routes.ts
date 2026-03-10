// apps/api/src/routes.ts
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
import { fiscalRoutes } from "./modules/fiscal/fiscal.routes";
import { ordersRoutes } from "./modules/orders/orders.routes";
import { paymentTermsRoutes } from "./modules/payment_terms/payment_terms.routes";
import { suppliersRoutes } from "./modules/suppliers/suppliers.routes";
import { rolesRoutes } from "./modules/roles/roles.routes";
import { usersRoutes } from "./modules/users/users.routes";
import { companyModulesRoutes } from "./modules/company_modules/company_modules.routes";
import { paymentMethodsRoutes } from "./modules/payment_methods/payment_methods.routes";
import { carriersRoutes } from "./modules/carriers/carriers.routes";
import { carrierVehiclesRoutes }  from "./modules/carrier-vehicles/carrier-vehicles.routes";
import chartOfAccountsRoutes from "@/modules/financial/chart-of-accounts/chart-of-accounts.routes";
import { costCentersRoutes } from "./modules/financial/cost-centers/cost-centers.routes";
import { productCategoriesRoutes } from "./modules/product-categories/product-categories.routes";



export async function routes(app: FastifyInstance) {
  await app.register(authRoutes);
  await app.register(companiesRoutes);
  await app.register(customersRoutes);
  await app.register(productsRoutes);
  await app.register(quotesRoutes);
  await app.register(salesRoutes);
  await app.register(inventoryRoutes);
  await app.register(inventoryMovementsRoutes);
  await app.register(bankAccountsRoutes);
  await app.register(receivablesRoutes);
  await app.register(dashboardRoutes);
  await app.register(brandingRoutes);
  await app.register(bankBalanceEventsRoutes);
  await app.register(fiscalRoutes);
  await app.register(ordersRoutes);
  await app.register(paymentTermsRoutes);
  await app.register(carrierVehiclesRoutes);
  await app.register(suppliersRoutes);
  await app.register(rolesRoutes);
  await app.register(usersRoutes);
  await app.register(companyModulesRoutes);
  await app.register(paymentMethodsRoutes);
  await app.register(carriersRoutes);
  await app.register(chartOfAccountsRoutes);
  await app.register(costCentersRoutes);
  await app.register(productCategoriesRoutes);
}
