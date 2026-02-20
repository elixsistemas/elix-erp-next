import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BrandingProvider, useBranding } from "@/contexts/BrandingContext";
import BankAccountsPage from "@/pages/cadastros/contas-bancarias/BankAccountsPage";
import CustomersPage from "./pages/cadastros/clientes/CustomersPage";
import ProductsPage from "./pages/cadastros/produtos/ProductsPage";
import InventoryPage from "./pages/estoque/InventoryPage";
import InventoryMovementsPage from "./pages/estoque/InventoryMovementsPage";
import SalesPage from "./pages/vendas/SalesPage";
import SaleDetailsPage from "./pages/vendas/SaleDetailsPage";
import OrdersListPage from "@/pages/pedidos/OrdersListPage";
import OrderDetailsPage from "@/pages/pedidos/OrderDetailsPage";
import OrderCreatePage from "@/pages/pedidos/OrderCreatePage";
import QuotesListPage from "@/pages/comercial/orcamentos/QuotesListPage";
import QuoteCreatePage from "@/pages/comercial/orcamentos/QuoteCreatePage";
import QuoteDetailsPage from "@/pages/comercial/orcamentos/QuoteDetailsPage";
import QuotePrintPage from "@/pages/comercial/orcamentos/QuotePrintPage";
import { Toaster } from "sonner";

import Login from "@/pages/Login";
import Dashboard from "@/pages/dashboard/DashboardPage";
import AppShell from "@/components/layout/AppShell";
import CompanyPage from "./pages/cadastros/empresa/CompanyPage";
import SuppliersPage from "./pages/cadastros/fornecedores/SuppliersPage";


function AppBoot() {
  const { isLoading: brandLoading } = useBranding();

  if (brandLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl font-medium text-gray-700 animate-pulse">
          Carregando identidade...
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<ProtectedLayout />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cadastros/contas-bancarias" element={<BankAccountsPage />} />
            <Route path="/cadastros/empresa" element={<CompanyPage />} />
            <Route path="/cadastros/clientes" element={<CustomersPage />} />
            <Route path="/cadastros/produtos" element={<ProductsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/inventory/movements" element={<InventoryMovementsPage />} />


            // Orçamentos
            <Route path="/comercial/orcamentos" element={<QuotesListPage />} />
            <Route path="/comercial/orcamentos/new" element={<QuoteCreatePage />} />
            <Route path="/comercial/orcamentos/:id" element={<QuoteDetailsPage />} />
            <Route path="/comercial/orcamentos/:id/print" element={<QuotePrintPage />} />

            // Pedidos
            <Route path="/orders" element={<OrdersListPage />} />
            <Route path="/orders/new" element={<OrderCreatePage />} />
            <Route path="/orders/:id" element={<OrderDetailsPage />} />

            // Vendas
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/sales/:id" element={<SaleDetailsPage />} />
            
            // Fornacedor
            <Route path="/cadastros/fornecedores" element={<SuppliersPage />} />

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
