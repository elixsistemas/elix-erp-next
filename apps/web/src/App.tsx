import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BrandingProvider, useBranding } from "@/contexts/BrandingContext";
import BankAccountsPage from "@/pages/cadastros/contas-bancarias/BankAccountsPage";
import CompaniesPage from "./pages/cadastros/empresas/CompaniesPage";
import CustomersPage from "./pages/cadastros/clientes/CustomersPage";
import ProductsPage from "./pages/cadastros/produtos/ProductsPage";
import { Toaster } from "sonner";

import Login from "@/pages/Login";
import Dashboard from "@/pages/dashboard/DashboardPage";
import AppShell from "@/components/layout/AppShell";


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
            <Route path="/cadastros/empresas" element={<CompaniesPage />} />
            <Route path="/cadastros/clientes" element={<CustomersPage />} />
            <Route path="/cadastros/produtos" element={<ProductsPage />} />
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
