// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api } from "@/shared/api/client";

type User = {
  id: number;
  companyId: number;
  name: string;
  email: string;
  role: string;
  roles?: string[];
};

type Company = {
  id: number;
  name: string;
  logo_base64?: string | null;
  logo_mime?: string | null;
};

type License = {
  status: "active" | "past_due" | "suspended" | "canceled";
  dueAt: string;
  graceDays: number;
  planCode: string;
  planName: string;
  userLimit: number;
  readOnly: boolean;
} | null;

type AuthContextType = {
  token: string | null;
  user: User | null;
  company: Company | null;
  modules: string[];
  permissions: string[];
  roles: string[];
  license: License;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [modules, setModules] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [license, setLicense] = useState<License>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    setToken(storedToken);
    void initialize(storedToken);
  }, []);

  async function initialize(jwt: string) {
    setIsLoading(true);
    try {
      const me = await api("/auth/me", {
        auth: false,
        headers: { Authorization: `Bearer ${jwt}` },
      });

      setUser(me.user ?? null);
      setCompany(me.company ?? null);
      setModules(Array.isArray(me.modules) ? me.modules : []);

      const perms = me.permissions ?? me.perms ?? [];
      setPermissions(Array.isArray(perms) ? perms : []);

      const userRoles = me.user?.roles ?? [];
      setRoles(Array.isArray(userRoles) ? userRoles : []);

      setLicense(me.license ?? null);
    } catch {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setCompany(null);
      setModules([]);
      setPermissions([]);
      setRoles([]);
      setLicense(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(jwt: string) {
    localStorage.setItem("token", jwt);
    setToken(jwt);
    await initialize(jwt);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setCompany(null);
    setModules([]);
    setPermissions([]);
    setRoles([]);
    setLicense(null);
    setIsLoading(false);
  }

  async function refresh() {
    const jwt = token ?? localStorage.getItem("token");
    if (!jwt) return;
    await initialize(jwt);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        company,
        modules,
        permissions,
        roles,
        license,
        isLoading,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}