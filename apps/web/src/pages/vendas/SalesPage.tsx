// apps/web/src/pages/vendas/SalesPage.tsx
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listSales, type SaleRow } from "./sales.service";

export default function SalesPage() {
  const nav = useNavigate();
  const [rows, setRows] = React.useState<SaleRow[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [q, setQ] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSales({ from: from || undefined, to: to || undefined });
      setRows(data);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => String(r.id).includes(term) || String(r.customer_id).includes(term));
  }, [rows, q]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Vendas</h1>
        <Button variant="secondary" onClick={reload}>
          Recarregar
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-2 lg:items-end lg:justify-between">
        <div className="flex flex-col sm:flex-row gap-2">
          <div>
            <div className="text-xs text-muted-foreground mb-1">De</div>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Até</div>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="sm:w-80">
            <div className="text-xs text-muted-foreground mb-1">Buscar (ID venda / cliente)</div>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex: 10 ou 3..." />
          </div>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left p-3">Venda</th>
              <th className="text-left p-3">Cliente</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Total</th>
              <th className="text-left p-3">Data</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3" colSpan={6}>Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="p-3" colSpan={6}>Nenhuma venda encontrada.</td></tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3 font-medium">#{r.id}</td>
                  <td className="p-3">#{r.customer_id}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3 text-right tabular-nums">{Number(r.total).toFixed(2)}</td>
                  <td className="p-3">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" onClick={() => nav(`/sales/${r.id}`)}>
                      Ver
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
