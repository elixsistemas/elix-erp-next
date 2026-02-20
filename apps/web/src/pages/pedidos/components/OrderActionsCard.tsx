// apps/web/src/pages/pedidos/components/OrderActionsCard.tsx
import { Button } from "@/components/ui/button";
import type { OrderDetails } from "../orders.types";

type Props = {
  data: OrderDetails;
  loading?: boolean;
  billing?: boolean;
  cancelling?: boolean;
  onReload: () => void;
  onBill: () => Promise<void>;
  onCancel: () => Promise<void>;
};

export function OrderActionsCard({
  data, loading, billing, cancelling,
  onReload, onBill, onCancel
}: Props) {
  const status = String(data.order.status).toLowerCase();

  const canBill = status === "draft";
  const canCancel = status === "draft";

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-medium">Ações</div>
        <Button size="sm" variant="secondary" onClick={onReload} disabled={!!loading || !!billing}>
          Atualizar
        </Button>
      </div>

      <div className="grid gap-2">
        <Button
          onClick={onBill}
          disabled={!canBill || !!loading || !!billing}
        >
          {billing ? "Faturando..." : "Faturar pedido (gera venda)"}
        </Button>

        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={!canCancel || !!loading || !!cancelling || !!billing}
        >
          {cancelling ? "Cancelando..." : "Cancelar pedido"}
        </Button>
      </div>

      <div className="text-[11px] text-muted-foreground">
        Faturar cria uma SALE (sem nota) e leva você direto para a venda.
      </div>

      {data.order.notes ? (
        <div className="text-xs text-muted-foreground border-t pt-3">
          <div className="font-medium text-slate-700 dark:text-slate-200 mb-1">Observações</div>
          <div className="whitespace-pre-wrap">{data.order.notes}</div>
        </div>
      ) : null}
    </div>
  );
}
