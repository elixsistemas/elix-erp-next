import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { GlobalUiResets } from "@/components/layout/GlobalUiResets";

import BankAccountsPage from "@/pages/cadastros/contas-bancarias/BankAccountsPage";
import CustomersPage from "@/pages/cadastros/clientes/CustomersPage";
import ProductsPage from "@/pages/cadastros/produtos/ProductsPage";
import CompanyPage from "@/pages/cadastros/empresa/CompanyPage";
import SuppliersPage from "@/pages/cadastros/fornecedores/SuppliersPage";

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
import FiscalPage from "@/pages/cadastros/fiscal/FiscalPage";

import RolesPage from "@/pages/admin/RolesPage";
import UsersPage from "@/pages/admin/UsersPage";

import Login from "@/pages/Login";
import Dashboard from "@/pages/dashboard/DashboardPage";
import AppShell from "@/components/layout/AppShell";

import { RequireAccess } from "@/components/auth/RequireAccess";
import ComingSoon from "@/pages/ComingSoon";
import CompanyModulesPage from "@/pages/admin/CompanyModulesPage";

import { Toaster } from "sonner";

function AppBoot() {
  return (
    <BrowserRouter>
    <Toaster position="top-right" richColors closeButton />
    <GlobalUiResets />

      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protegidas */}
        <Route element={<ProtectedLayout />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Cadastros */}
            <Route path="/cadastros/contas-bancarias" element={<BankAccountsPage />} />
            <Route
              path="/cadastros/empresa"
              element={
                <RequireAccess perm="companies.read" module="cadastros.companies">
                  <CompanyPage />
                </RequireAccess>
              }
            />
            <Route
              path="/cadastros/clientes"
              element={
                <RequireAccess perm="customers.read" module="cadastros.customers">
                  <CustomersPage />
                </RequireAccess>
              }
            />
            <Route
              path="/cadastros/produtos"
              element={
                <RequireAccess perm="products.read" module="cadastros.products">
                  <ProductsPage />
                </RequireAccess>
              }
            />
            <Route
              path="/cadastros/fornecedores"
              element={
                <RequireAccess perm="suppliers.read" module="cadastros.suppliers">
                  <SuppliersPage />
                </RequireAccess>
              }
            />
            <Route path="/cadastros/fiscal" element={<FiscalPage />} />

            {/* Estoque */}
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/inventory/movements" element={<InventoryMovementsPage />} />

            {/* Comercial */}
            <Route path="/comercial/orcamentos" element={<QuotesListPage />} />
            <Route path="/comercial/orcamentos/new" element={<QuoteCreatePage />} />
            <Route path="/comercial/orcamentos/:id" element={<QuoteDetailsPage />} />
            <Route path="/comercial/orcamentos/:id/print" element={<QuotePrintPage />} />

            <Route path="/comercial/pedidos" element={<PedidosListPage />} />
            <Route path="/comercial/pedidos/new" element={<PedidoDetailsPage />} />
            <Route path="/comercial/pedidos/:id" element={<PedidoDetailsPage />} />
            <Route path="/comercial/pedidos/:id/print" element={<PedidoPrintPage />} />

            <Route path="/comercial/vendas" element={<VendasListPage />} />
            <Route path="/comercial/vendas/new" element={<VendaDetailsPage />} />
            <Route path="/comercial/vendas/:id" element={<VendaDetailsPage />} />
            <Route path="/comercial/vendas/:id/print" element={<VendaPrintPage />} />

            {/* Admin */}
            <Route path="/admin/company/modules" element={<CompanyModulesPage />} />
            {/* <Route path="/security/roles" element={<RequireAccess perm="roles.read" module="admin.roles"> <RolesPage /></RequireAccess>}/> */}
            <Route path="/security/roles" element={<RolesPage />} />
            <Route path="/security/users" element={<UsersPage />} />
            {/* 
            
            <Route
              path="/security/users"
              element={
                <RequireAccess perm="users.read" module="admin.users">
                  <UsersPage />
                </RequireAccess>
              }/>}
            />
            
            */}
            <Route path="/settings" element={<ComingSoon title="Configurações" />} />
            <Route path="/settings/*" element={<ComingSoon title="Configurações" />} />

            <Route path="/security" element={<ComingSoon title="Segurança" />} />
            <Route path="/security/*" element={<ComingSoon title="Segurança" />} />

            <Route path="/copilot" element={<ComingSoon title="Copilot" />} />
            <Route path="/copilot/*" element={<ComingSoon title="Copilot" />} />

            <Route path="/finance" element={<ComingSoon title="Financeiro" />} />
            <Route path="/finance/*" element={<ComingSoon title="Financeiro" />} />

            <Route path="/fiscal" element={<ComingSoon title="Fiscal" />} />
            <Route path="/fiscal/*" element={<ComingSoon title="Fiscal" />} />

            <Route path="/reports" element={<ComingSoon title="Relatórios" />} />
            <Route path="/reports/*" element={<ComingSoon title="Relatórios" />} />
          </Route>
        </Route>

        {/* fallback */}
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