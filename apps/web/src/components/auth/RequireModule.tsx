// apps/web/src/components/auth/RequireModule.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  module?: string;
  fallback?: string;
};

export function RequireModule({ module, fallback = "/dashboard" }: Props) {
  const { modules, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ padding: 24 }}>Carregando módulo...</div>;
  }

  if (!module) return <Outlet />;

  const enabled = Array.isArray(modules) && modules.includes(module);
  if (!enabled) {
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}