// apps/web/src/pages/pedidos/OrderDetailsPage.tsx
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useOrderDetails } from "./useOrderDetails";
import { OrderItemsTable } from "./components/OrderItemsTable";
import { OrderActionsCard } from "./components/OrderActionsCard";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function OrderDetailsPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const orderId = Number(id);

  const { data, loading, reload, billing, cancelling, bill, cancel } = useOrderDetails(orderId);

  if (!Number.isFinite(orderId) || orderId <= 0) {
    return <div className="p-4">ID inválido.</div>;
  }

  async function handleBill() {
    const ok = confirm("Faturar este pedido? Isso irá gerar uma venda (SALE).");
    if (!ok) return;

    try {
      const res = await bill();
      const saleId = Number((res as any)?.saleId);
      if (!Number.isFinite(saleId) || saleId <= 0) {
        toast.success("Pedido faturado.");
        await reload();
        return;
      }

      toast.success(`Pedido faturado. Indo para venda #${saleId}...`);
      nav(`/sales/${saleId}`);
    } catch (e: any) {
      const status = Number(e?.status ?? 0);

      if (status === 409) toast.warning("Pedido já faturado ou indisponível.");
      else if (status === 404) toast.error("Pedido não encontrado.");
      else toast.error(String(e?.message ?? "Erro").slice(0, 160));

      await reload();
    }
  }

  async function handleCancel() {
    const ok = confirm("Cancelar este pedido?");
    if (!ok) return;

    try {
      await cancel();
      toast.success("Pedido cancelado.");
      await reload();
    } catch (e: any) {
      toast.error(String(e?.message ?? "Erro ao cancelar"));
      await reload();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-muted-foreground">Pedido</div>
          <h1 className="text-xl font-semibold">#{orderId}</h1>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => nav("/orders")}>
            Voltar
          </Button>
          <Button variant="secondary" onClick={reload} disabled={loading || billing}>
            Recarregar
          </Button>
        </div>
      </div>

      {loading && !data ? (
        <div>Carregando...</div>
      ) : !data ? (
        <div>Pedido não encontrado.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Status</div>
              <div className="text-lg font-semibold">{data.order.status}</div>
              <div className="text-xs text-muted-foreground mt-2">Cliente #{data.order.customer_id}</div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-lg font-semibold tabular-nums">
                {brl.format(Number(data.order.total))}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Subtotal: {Number(data.order.subtotal).toFixed(2)} | Desc:{" "}
                {Number(data.order.discount ?? 0).toFixed(2)}
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Criado em</div>
              <div className="text-lg font-semibold">
                {new Date(data.order.created_at).toLocaleString("pt-BR")}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Faturado em: {data.order.billed_at ? new Date(data.order.billed_at).toLocaleString("pt-BR") : "—"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
            <div className="xl:col-span-2">
              <OrderItemsTable items={data.items} />
            </div>

            <OrderActionsCard
              data={data}
              loading={loading}
              billing={billing}
              cancelling={cancelling}
              onReload={reload}
              onBill={handleBill}
              onCancel={handleCancel}
            />
          </div>
        </>
      )}
    </div>
  );
}
