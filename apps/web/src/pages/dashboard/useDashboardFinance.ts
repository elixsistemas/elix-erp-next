// useDashboardFinance.ts
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { currentYYYYMM } from "./dashboard.utils";
import type { FinanceSummary } from "./dashboard.types";
import { getFinanceSummary } from "./dashboard.service";

export function useDashboardFinance() {
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState<string>(() => currentYYYYMM());
  const [finance, setFinance] = useState<FinanceSummary | null>(null);

  const firstName = useMemo(() => {
    const name = user?.name?.trim();
    if (!name) return "Administrador";
    return name.split(/\s+/)[0];
  }, [user?.name]);

  async function load() {
    try {
      setLoading(true);

      // garante que existe token no storage/context
      const authToken = token ?? localStorage.getItem("token");
      if (!authToken) throw new Error("Token ausente");

      const data = await getFinanceSummary(month);
      setFinance(data);
    } catch (e: any) {
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
    // token entra aqui só pra recarregar quando login mudar
  }, [month, token]);

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
    ...view,
    reload: load,
  };
}
