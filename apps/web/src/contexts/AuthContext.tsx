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
};

type Company = {
  id: number;
  name: string;
  logo_base64?: string | null;
  logo_mime?: string | null;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  company: Company | null;
  modules: string[];
  permissions: string[];
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
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 Boot automático ao abrir o sistema
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    void initialize(storedToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function initialize(jwt: string) {
    setIsLoading(true);

    try {
      const me = await api<any>("/auth/me", {
        auth: false,
        headers: { Authorization: `Bearer ${jwt}` },
      });

      setUser(me.user ?? null);
      setCompany(me.company ?? null);
      setModules(Array.isArray(me.modules) ? me.modules : []);

      const perms = me.permissions ?? me.perms ?? [];
      setPermissions(Array.isArray(perms) ? perms : []);
    } catch {
      // ✅ não chama logout aqui (evita efeitos colaterais em guards)
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setCompany(null);
      setModules([]);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(jwt: string) {
    // ✅ grava primeiro, depois inicializa
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
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}