import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { GlobalUiResets } from "@/components/layout/GlobalUiResets";
import { RequireModule } from "@/components/auth/RequireModule";
import { RequireAccess } from "@/components/auth/RequireAccess";
import AppShell from "@/components/layout/AppShell";
import { Toaster } from "sonner";

import Login from "@/pages/Login";
import ComingSoon from "@/pages/ComingSoon";
import Dashboard from "@/pages/dashboard/DashboardPage";

import CompanyPage from "@/pages/cadastros/empresa/CompanyPage";
import CustomersPage from "@/pages/cadastros/clientes/CustomersPage";
import SuppliersPage from "@/pages/cadastros/fornecedores/SuppliersPage";
import CarriersPage from "@/pages/cadastros/transportadoras/CarriersPage";
import ProductsPage from "@/pages/cadastros/produtos/ProductsPage";
import FiscalPage from "@/pages/cadastros/fiscal/FiscalPage";
import BankAccountsPage from "@/pages/cadastros/contas-bancarias/BankAccountsPage";
import PaymentMethodsPage from "@/pages/cadastros/meios-pagamento/PaymentMethodsPage";
import PaymentTermsPage from "@/pages/cadastros/condicoes-pagamento/PaymentTermsPage";

import InventoryPage from "@/pages/estoque/InventoryPage";
import InventoryMovementsPage from "@/pages/estoque/InventoryMovementsPage";

import QuotesListPage from "@/pages/comercial/orcamentos/QuotesListPage";
import QuoteCreatePage from "@/pages/comercial/orcamentos/QuoteCreatePage";
import QuoteDetailsPage from "@/pages/comercial/orcamentos/QuoteDetailsPage";
import QuotePrintPage from "@/pages/comercial/orcamentos/QuotePrintPage";

import PedidosListPage from "@/pages/comercial/pedidos/PedidosListPage";
import PedidoDetailsPage from "@/pages/comercial/pedidos/PedidoDetailsPage";
import PedidoPrintPage from "@/pages/comercial/pedidos/PedidoPrintPage";

import VendasListPage from "@/pages/comercial/vendas/VendasListPage";
import VendaDetailsPage from "@/pages/comercial/vendas/VendaDetailsPage";
import VendaPrintPage from "@/pages/comercial/vendas/VendaPrintPage";

import RolesPage from "@/pages/admin/RolesPage";
import UsersPage from "@/pages/admin/UsersPage";
import CompanyModulesPage from "@/pages/admin/CompanyModulesPage";

function RootRedirect() {
  const { token, isLoading } = useAuth();

  if (isLoading) return null;
  return <Navigate to={token ? "/dashboard" : "/login"} replace />;
}

function AppBoot() {
  return (
    <BrowserRouter>
    <Toaster position="top-right" richColors closeButton />
    <GlobalUiResets />

      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RootRedirect />
          }
        />

        {/* Protegidas */}
        <Route element={<ProtectedLayout />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Cadastros */}
            <Route element={<RequireModule module="cadastros.customers" />}>
              <Route
                path="/cadastros/clientes"
                element={
                  <RequireAccess perm="customers.read" >
                    <CustomersPage />
                  </RequireAccess>
                }
              />
            </Route>
            <Route element={<RequireModule module="cadastros.products" />}>
              <Route
                path="/cadastros/produtos"
                element={
                  <RequireAccess perm="products.read">
                    <ProductsPage />
                  </RequireAccess>
                }
              />
            </Route>
              <Route element={<RequireModule module="cadastros.suppliers" />}>
                <Route
                  path="/cadastros/fornecedores"
                  element={
                    <RequireAccess perm="suppliers.read">
                      <SuppliersPage />
                  </RequireAccess>
                }
              />
            </Route>
            <Route element={<RequireModule module="cadastros.carriers" />}>
              <Route
                path="/cadastros/transportadoras"
                element={
                  <RequireAccess perm="carriers.read">
                    <CarriersPage />
                  </RequireAccess>
                }
              />
            </Route>
            <Route element={<RequireModule module="fiscal.rules" />}>
              <Route
                path="/fiscal/tax-profiles"
                element={
                  <RequireAccess perm="tax_rules.read">
                    <FiscalPage />
                  </RequireAccess>
                }
              />
            </Route>

            <Route element={<RequireModule module="cadastros.bank_accounts" />}>
              <Route path="/cadastros/contas-bancarias" element={<BankAccountsPage />} />
              <Route
                path="/cadastros/empresa"
                element={
                  <RequireAccess perm="companies.read" >
                    <CompanyPage />
                  </RequireAccess>
                }
              />
            </Route>

            <Route element={<RequireModule module="cadastros.payment_methods" />}>
              <Route
                path="/cadastros/meios-pagamento"
                element={
                  <RequireAccess perm="payment_methods.read">
                    <PaymentMethodsPage />
                  </RequireAccess>
                }
              />
            </Route>

            <Route element={<RequireModule module="cadastros.payment_terms" />}>
              <Route
                path="/cadastros/condicoes"
                element={
                  <RequireAccess perm="payment_terms.read">
                    <PaymentTermsPage />
                  </RequireAccess>
                }
              />
            </Route>

            {/* Estoque */}
            <Route element={<RequireModule module="inventory.stock" />}>
              <Route
                path="/inventory"
                element={
                  <RequireAccess perm="inventory.read">
                    <InventoryPage />
                  </RequireAccess>
                }
              />
            </Route>

            <Route element={<RequireModule module="inventory.movements" />}>
              <Route
                path="/inventory/movements"
                element={
                  <RequireAccess perm="inventory_movements.read">
                    <InventoryMovementsPage />
                  </RequireAccess>
                }
              />
            </Route>

            {/* Comercial */}
            <Route element={<RequireModule module="commercial.quotes" />}>
              <Route
                path="/comercial/orcamentos"
                element={
                  <RequireAccess perm="quotes.read">
                    <QuotesListPage />
                  </RequireAccess>
                }
              />
              <Route
                path="/comercial/orcamentos/new"
                element={
                  <RequireAccess perm="quotes.create">
                    <QuoteCreatePage />
                  </RequireAccess>
                }
              />
              <Route
                path="/comercial/orcamentos/:id"
                element={
                  <RequireAccess perm="quotes.read">
                    <QuoteDetailsPage />
                  </RequireAccess>
                }
              />
              <Route
                path="/comercial/orcamentos/:id/print"
                element={
                  <RequireAccess perm="quotes.print">
                    <QuotePrintPage />
                  </RequireAccess>
                }
              />
            </Route>

            <Route element={<RequireModule module="commercial.orders" />}>
              <Route
                path="/comercial/pedidos"
                element={
                  <RequireAccess perm="orders.read">
                    <PedidosListPage />
                  </RequireAccess>
                }
              />
              <Route
                path="/comercial/pedidos/new"
                element={
                  <RequireAccess perm="orders.create">
                    <PedidoDetailsPage />
                  </RequireAccess>
                }
              />
              <Route
                path="/comercial/pedidos/:id"
                element={
                  <RequireAccess perm="orders.read">
                    <PedidoDetailsPage />
                  </RequireAccess>
                }
              />
              <Route
                path="/comercial/pedidos/:id/print"
                element={
                  <RequireAccess perm="orders.print">
                    <PedidoPrintPage />
                  </RequireAccess>
                }
              />
            </Route>

            <Route element={<RequireModule module="commercial.sales" />}>
              <Route
                path="/comercial/vendas"
                element={
                  <RequireAccess perm="sales.read">
                    <VendasListPage />
                  </RequireAccess>
                }
              />
              <Route
                path="/comercial/vendas/new"
                element={
                  <RequireAccess perm="sales.create">
                    <VendaDetailsPage />
                  </RequireAccess>
                }
              />
              <Route
                path="/comercial/vendas/:id"
                element={
                  <RequireAccess perm="sales.read">
                    <VendaDetailsPage />
                  </RequireAccess>
                }
              />
              <Route
                path="/comercial/vendas/:id/print"
                element={
                  <RequireAccess perm="sales.print">
                    <VendaPrintPage />
                  </RequireAccess>
                }
              />
            </Route>

            {/* Admin */}
            <Route element={<RequireModule module="admin.settings" />}>
              <Route
                path="/settings/modules"
                element={
                  <RequireAccess perm="company_modules.read">
                    <CompanyModulesPage />
                  </RequireAccess>
                }
              />
            </Route>
     
            <Route element={<RequireModule module="admin.roles" />}>
              <Route
                path="/security/roles"
                element={
                  <RequireAccess perm="roles.read" >
                    <RolesPage />
                  </RequireAccess>
                }
              />
            </Route>

            <Route element={<RequireModule module="admin.users" />}>
              <Route
                path="/security/users"
                element={
                  <RequireAccess perm="users.read" >
                    <UsersPage />
                  </RequireAccess>
                }
              />
            </Route>

            <Route element={<RequireModule module="admin.settings" />}>
              <Route
                path="/settings"
                element={<ComingSoon title="Configurações" />}
              />
              <Route
                path="/settings/*"
                element={<ComingSoon title="Configurações" />}
              />
              <Route
                path="/security"
                element={<ComingSoon title="Segurança" />}
              />
              <Route
                path="/security/*"
                element={<ComingSoon title="Segurança" />}
              />

              <Route
                path="/copilot"
                element={<ComingSoon title="Copilot" />}
              />
              <Route
                path="/copilot/*"
                element={<ComingSoon title="Copilot" />}
              />

              <Route
                path="/finance"
                element={<ComingSoon title="Financeiro" />}
              />
              <Route
                path="/finance/*"
                element={<ComingSoon title="Financeiro" />}
              />

              <Route
                path="/fiscal"
                element={<ComingSoon title="Fiscal" />}
              />
              <Route
                path="/fiscal/*"
                element={<ComingSoon title="Fiscal" />}
              />

              <Route
                path="/reports"
                element={<ComingSoon title="Relatórios" />}
              />
              <Route
                path="/reports/*"
                element={<ComingSoon title="Relatórios" />}
              />
            </Route>
          </Route>
        </Route>

        {/* fallback */}

        <Route element={<ProtectedLayout />}>
          <Route element={<AppShell />}>
            ...
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function ProtectedLayout() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl font-medium text-gray-700 animate-pulse">
          Carregando sistema...
        </p>
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrandingProvider>
        <AppBoot />
      </BrandingProvider>
    </AuthProvider>
  );
}