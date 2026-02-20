// apps/web/src/pages/pedidos/OrdersListPage.tsx
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { OrdersToolbar } from "./components/OrdersToolbar";
import { OrdersTable } from "./components/OrdersTable";
import { useOrdersList } from "./useOrdersList";
import { Button } from "@/components/ui/button";

export default function OrdersListPage() {
  const nav = useNavigate();
  const s = useOrdersList();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Pedidos</h1>
          <div className="text-xs text-muted-foreground">
            Fluxo: Pedido → Faturar → Venda (sem nota)
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => nav("/orders/new")}>Novo pedido</Button>
          <Button variant="secondary" onClick={s.reload} disabled={s.loading}>
            Recarregar
          </Button>
        </div>
      </div>

      <OrdersToolbar
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

      <OrdersTable
        rows={s.rows}
        loading={s.loading}
        onView={(id) => nav(`/orders/${id}`)}
      />
    </div>
  );
}
