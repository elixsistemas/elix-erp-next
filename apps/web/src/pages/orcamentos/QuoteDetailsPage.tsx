import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { useQuoteDetails } from "./useQuoteDetails";
import { patchQuote, createOrderFromQuote, createSaleFromQuote } from "./quotes.service";
import { QuoteItemsTable } from "./components/QuoteItemsTable";
import { QuoteActionsCard } from "./components/QuoteActionsCard";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function QuoteDetailsPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const quoteId = Number(id);

  const { data, loading, reload } = useQuoteDetails(quoteId);

  if (!Number.isFinite(quoteId) || quoteId <= 0) return <div className="p-4">ID inválido.</div>;

  async function approve() {
    const ok = confirm("Aprovar este orçamento?");
    if (!ok) return;
    try {
      await patchQuote(quoteId, { status: "approved" });
      toast.success("Orçamento aprovado.");
      await reload();
    } catch (e: any) {
      toast.error(String(e?.message ?? "Erro ao aprovar").slice(0, 160));
    }
  }

  async function cancel() {
    const ok = confirm("Cancelar este orçamento?");
    if (!ok) return;
    try {
      await patchQuote(quoteId, { status: "cancelled" });
      toast.success("Orçamento cancelado.");
      await reload();
    } catch (e: any) {
      toast.error(String(e?.message ?? "Erro ao cancelar").slice(0, 160));
    }
  }

  async function genOrder() {
    const ok = confirm("Gerar pedido a partir deste orçamento?");
    if (!ok) return;

    try {
      const r = await createOrderFromQuote(quoteId);
      toast.success(`Pedido gerado. Indo para pedido #${r.orderId}...`);
      nav(`/orders/${r.orderId}`);
    } catch (e: any) {
      toast.error(String(e?.message ?? "Erro ao gerar pedido").slice(0, 200));
    }
  }

  async function genSale() {
    const ok = confirm("Gerar venda a partir deste orçamento? Isso pode baixar estoque conforme sua regra atual.");
    if (!ok) return;

    try {
      const r = await createSaleFromQuote(quoteId);
      toast.success(`Venda gerada. Indo para venda #${r.saleId}...`);
      nav(`/sales/${r.saleId}`);
    } catch (e: any) {
      toast.error(String(e?.message ?? "Erro ao gerar venda").slice(0, 200));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-muted-foreground">Orçamento</div>
          <h1 className="text-xl font-semibold">#{quoteId}</h1>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => nav("/quotes")}>Voltar</Button>
          <Button variant="secondary" onClick={reload} disabled={loading}>Recarregar</Button>
        </div>
      </div>

      {loading && !data ? (
        <div>Carregando...</div>
      ) : !data ? (
        <div>Orçamento não encontrado.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Status</div>
              <div className="text-lg font-semibold">{data.quote.status}</div>
              <div className="text-xs text-muted-foreground mt-2">Cliente #{data.quote.customer_id}</div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-lg font-semibold tabular-nums">{brl.format(Number(data.quote.total))}</div>
              <div className="text-xs text-muted-foreground mt-2">
                Subtotal: {brl.format(Number(data.quote.subtotal))} | Desc: {brl.format(Number(data.quote.discount ?? 0))}
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Criado em</div>
              <div className="text-lg font-semibold">{new Date(data.quote.created_at).toLocaleString("pt-BR")}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
            <div className="xl:col-span-2">
              <QuoteItemsTable items={data.items} />
            </div>

            <QuoteActionsCard
              data={data}
              loading={loading}
              onReload={reload}
              onApprove={approve}
              onCancel={cancel}
              onCreateOrder={genOrder}
              onCreateSale={genSale}
            />
          </div>

          {data.quote.notes ? (
            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Observações</div>
              <div className="whitespace-pre-wrap mt-2">{data.quote.notes}</div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
