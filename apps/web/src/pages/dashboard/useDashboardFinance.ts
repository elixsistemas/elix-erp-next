// useDashboardFinance.ts
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { currentYYYYMM } from "./dashboard.utils";
import type { FinanceSummary } from "./dashboard.types";
import { getFinanceSummary } from "./dashboard.service";

const PERM_FINANCE_SUMMARY = "cashflow.read";

export function useDashboardFinance() {
  const { user, token, permissions, isLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState<string>(() => currentYYYYMM());
  const [finance, setFinance] = useState<FinanceSummary | null>(null);

  const canViewFinance = useMemo(
    () => Array.isArray(permissions) && permissions.includes(PERM_FINANCE_SUMMARY),
    [permissions]
  );

  const firstName = useMemo(() => {
    const name = user?.name?.trim();
    if (!name) return "Administrador";
    return name.split(/\s+/)[0];
  }, [user?.name]);

  async function load() {
    try {
      setLoading(true);

      // ✅ espera o bootstrap do AuthContext terminar (evita 401/403 “fantasma”)
      if (isLoading) return;

      // ✅ se não tem perm, não chama API e não dá toast de erro
      if (!canViewFinance) {
        setFinance(null);
        return;
      }

      // garante que existe token no storage/context
      const authToken = token ?? localStorage.getItem("token");
      if (!authToken) throw new Error("Token ausente");

      const data = await getFinanceSummary(month);
      setFinance(data);
    } catch (e: any) {
      // ✅ se vier 403 mesmo assim, trata como “sem acesso” (sem assustar)
      const status = e?.status ?? e?.response?.status;
      if (status === 403) {
        setFinance(null);
        return;
      }

      console.error("[Dashboard] erro:", e);
      setFinance(null);
      toast.error("Erro ao carregar o painel financeiro", {
        description: e?.message || "Verifique conexão ou autenticação",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // recarrega quando muda mês, token (troca empresa), perms (após /auth/me), ou bootstrap
  }, [month, token, canViewFinance, isLoading]);

  const view = useMemo(() => {
    const totalBalance = finance?.totalBalance ?? 0;
    const inflowMonth = finance?.inflowMonth ?? 0;
    const outflowMonth = finance?.outflowMonth ?? 0;
    const netMonth = finance?.netMonth ?? 0;
    const accounts = finance?.accounts ?? [];
    return { totalBalance, inflowMonth, outflowMonth, netMonth, accounts };
  }, [finance]);

  return {
    loading,
    month,
    setMonth,
    firstName,
    finance,
    canViewFinance,
    ...view,
    reload: load,
  };
}