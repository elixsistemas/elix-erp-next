import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useSaleDetails } from "./useSaleDetails";
import { issueSaleFiscal } from "./sales.service";

import { SaleItemsTable } from "./components/SaleItemsTable";
import { PaymentCard } from "./components/PaymentCard";
import { FiscalCard } from "./components/FiscalCard";
import { InstallmentsModal } from "./components/InstallmentsModal";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function SaleDetailsPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const saleId = Number(id);

  const { data, fiscal, loading, reload } = useSaleDetails(saleId);

  const [issuing, setIssuing] = React.useState<"NFE" | "NFSE" | "BOTH" | null>(null);
  const [installmentsOpen, setInstallmentsOpen] = React.useState(false);

  if (!Number.isFinite(saleId) || saleId <= 0) {
    return <div className="p-4">ID inválido.</div>;
  }

  async function handleIssue(type: "NFE" | "NFSE" | "BOTH") {
    setIssuing(type);
    try {
      await issueSaleFiscal(saleId, type);
      toast.success("Documento fiscal gerado.");
      await reload();
    } catch (e: any) {
      const status = Number(e?.status ?? 0);
      const msg = String(e?.message ?? "");

      if (status === 409 || msg.toLowerCase().includes("already exists")) {
        toast.warning("Já existe documento fiscal ativo para este tipo.");
        await reload();
        return;
      }
      if (status === 404) {
        toast.error("Venda não encontrada.");
        return;
      }
      toast.error(msg.slice(0, 160));
    } finally {
      setIssuing(null);
    }
  }

  const sale = data?.sale ?? null;
  const docs = fiscal?.documents ?? [];

  const canClose = sale?.status === "open";

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-muted-foreground">Venda</div>
          <h1 className="text-xl font-semibold">#{saleId}</h1>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => nav("/sales")}>
            Voltar
          </Button>
          <Button variant="secondary" onClick={reload} disabled={loading || issuing !== null}>
            Recarregar
          </Button>

          {canClose ? (
            <Button onClick={() => setInstallmentsOpen(true)} disabled={loading || issuing !== null}>
              Gerar parcelas / Fechar
            </Button>
          ) : (
            <Button variant="secondary" disabled>
              Venda {sale?.status === "closed" ? "finalizada" : "indisponível"}
            </Button>
          )}
        </div>
      </div>

      {loading && !data ? (
        <div>Carregando...</div>
      ) : !data ? (
        <div>Venda não encontrada.</div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Status</div>
              <div className="text-lg font-semibold">{sale!.status}</div>
              <div className="text-xs text-muted-foreground mt-2">Cliente #{sale!.customer_id}</div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-lg font-semibold tabular-nums">{brl.format(Number(sale!.total))}</div>
              <div className="text-xs text-muted-foreground mt-2">
                Subtotal: {brl.format(Number(sale!.subtotal))} | Desc: {brl.format(Number(sale!.discount ?? 0))}
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Criada em</div>
              <div className="text-lg font-semibold">
                {new Date(sale!.created_at).toLocaleString("pt-BR")}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Quote #{sale!.quote_id ?? "—"} · Pedido #{sale!.order_id ?? "—"}
              </div>
            </div>
          </div>

          {/* Payment */}
          <PaymentCard sale={sale!} disabled={!canClose} onSaved={reload} />

          {/* Items + Fiscal */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
            <div className="xl:col-span-2">
              <SaleItemsTable items={data.items} />
            </div>

            <FiscalCard
              docs={docs}
              loading={loading}
              issuing={issuing}
              onReload={reload}
              onIssue={handleIssue}
            />
          </div>

          {/* Notes */}
          {sale!.notes ? (
            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Observações</div>
              <div className="whitespace-pre-wrap mt-2">{sale!.notes}</div>
            </div>
          ) : null}
        </>
      )}

      {/* Modal */}
      {sale ? (
        <InstallmentsModal
          sale={sale}
          open={installmentsOpen}
          onOpenChange={setInstallmentsOpen}
          onClosed={reload}
        />
      ) : null}
    </div>
  );
}
