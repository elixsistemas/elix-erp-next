import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { useSalesList } from "./useSalesList";
import { SalesToolbar } from "./components/SalesToolbar";
import { SalesTable } from "./components/SalesTable";

export default function SalesPage() {
  const nav = useNavigate();
  const s = useSalesList();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Vendas</h1>
          <div className="text-xs text-muted-foreground">
            Fluxo: Venda (open) → Gerar parcelas → Fechar (gera contas a receber) → Fiscal (opcional)
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={s.reload} disabled={s.loading}>
            Recarregar
          </Button>
        </div>
      </div>

      <SalesToolbar
        from={s.from}
        to={s.to}
        status={s.status}
        customerId={s.customerId}
        onChangeFrom={s.setFrom}
        onChangeTo={s.setTo}
        onChangeStatus={s.setStatus}
        onChangeCustomerId={s.setCustomerId}
        onReload={s.reload}
      />

      <SalesTable
        rows={s.rows}
        loading={s.loading}
        onView={(id) => nav(`/sales/${id}`)}
      />
    </div>
  );
}
