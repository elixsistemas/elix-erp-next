import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QuotesToolbar } from "./components/QuotesToolbar";
import { QuotesTable } from "./components/QuotesTable";
import { useQuotesList } from "./useQuotesList";

export default function QuotesListPage() {
  const nav = useNavigate();
  const s = useQuotesList();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Orçamentos</h1>
          <div className="text-xs text-muted-foreground">
            Fluxo: Orçamento → (Pedido) → Venda → Parcelas → Fiscal (opcional)
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => nav("/quotes/new")}>Novo orçamento</Button>
          <Button variant="secondary" onClick={s.reload} disabled={s.loading}>Recarregar</Button>
        </div>
      </div>

      <QuotesToolbar
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

      <QuotesTable rows={s.rows} loading={s.loading} onView={(id) => nav(`/quotes/${id}`)} />
    </div>
  );
}
