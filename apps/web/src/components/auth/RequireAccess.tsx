import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type RequireAccessProps = {
  children: ReactNode;
  perm?: string;
  module?: string;
};

export function RequireAccess({ children, perm, module }: RequireAccessProps) {
  const { token, isLoading, permissions, modules } = useAuth();

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Carregando...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (module && !modules.includes(module)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (perm && !permissions.includes(perm)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}