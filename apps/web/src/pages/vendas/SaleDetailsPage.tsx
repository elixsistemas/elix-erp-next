// apps/web/src/pages/vendas/SaleDetailsPage.tsx
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getSale, listSaleFiscal, type SaleDetails } from "./sales.service";

export default function SaleDetailsPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const saleId = Number(id);

  const [data, setData] = React.useState<SaleDetails | null>(null);
  const [fiscal, setFiscal] = React.useState<{ documents: any[] } | null>(null);
  const [loading, setLoading] = React.useState(false);

  const reload = React.useCallback(async () => {
    if (!Number.isFinite(saleId) || saleId <= 0) return;
    setLoading(true);
    try {
      const [s, f] = await Promise.all([getSale(saleId), listSaleFiscal(saleId)]);
      setData(s);
      setFiscal(f);
    } finally {
      setLoading(false);
    }
  }, [saleId]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const docs = fiscal?.documents ?? [];
  const nfe = docs.find((d) => d.type === "NFE") ?? null;
  const nfse = docs.find((d) => d.type === "NFSE") ?? null;

  if (!Number.isFinite(saleId) || saleId <= 0) {
    return <div className="p-4">ID inválido.</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xs text-muted-foreground">Venda</div>
          <h1 className="text-xl font-semibold">#{saleId}</h1>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => nav("/sales")}>Voltar</Button>
          <Button variant="secondary" onClick={reload}>Recarregar</Button>
        </div>
      </div>

      {loading && !data ? (
        <div>Carregando...</div>
      ) : !data ? (
        <div>Venda não encontrada.</div>
      ) : (
        <>
          {/* Top summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Status</div>
              <div className="text-lg font-semibold">{data.sale.status}</div>
              <div className="text-xs text-muted-foreground mt-2">Cliente #{data.sale.customer_id}</div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-lg font-semibold tabular-nums">{Number(data.sale.total).toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-2">
                Subtotal: {Number(data.sale.subtotal).toFixed(2)} | Desc: {Number(data.sale.discount ?? 0).toFixed(2)}
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Criada em</div>
              <div className="text-lg font-semibold">{new Date(data.sale.created_at).toLocaleString("pt-BR")}</div>
              <div className="text-xs text-muted-foreground mt-2">Quote #{data.sale.quote_id ?? "-"}</div>
            </div>
          </div>

          {/* Items + Fiscal card */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
            <div className="xl:col-span-2 rounded-xl border overflow-hidden">
              <div className="p-3 border-b bg-muted/40 font-medium">Itens</div>
              <table className="w-full text-sm">
                <thead className="bg-muted/20">
                  <tr>
                    <th className="text-left p-3">Descrição</th>
                    <th className="text-right p-3">Qtd</th>
                    <th className="text-right p-3">Unit</th>
                    <th className="text-right p-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="p-3">
                        <div className="font-medium">{it.description}</div>
                        <div className="text-xs text-muted-foreground">Produto #{it.product_id}</div>
                      </td>
                      <td className="p-3 text-right tabular-nums">{it.quantity}</td>
                      <td className="p-3 text-right tabular-nums">{Number(it.unit_price).toFixed(2)}</td>
                      <td className="p-3 text-right tabular-nums">{Number(it.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border p-4 space-y-3">
              <div className="font-medium">Fiscal</div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">NF-e</div>
                    <div className="text-xs text-muted-foreground">
                      {nfe ? `Status: ${nfe.status}` : "Não gerada"}
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" disabled>
                    {nfe ? "Ver" : "Gerar"}
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">NFS-e</div>
                    <div className="text-xs text-muted-foreground">
                      {nfse ? `Status: ${nfse.status}` : "Não gerada"}
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" disabled>
                    {nfse ? "Ver" : "Gerar"}
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                * Botões ainda em stub. Próximo nível: emitir/cancelar + PDF/XML.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
