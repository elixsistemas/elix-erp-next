// apps/web/src/pages/pedidos/components/OrdersTable.tsx
import { Button } from "@/components/ui/button";
import type { OrderRow } from "../orders.types";

type Props = {
  rows: OrderRow[];
  loading?: boolean;
  onView: (id: number) => void;
};

function labelStatus(s: string) {
  const v = String(s).toLowerCase();
  if (v === "draft") return "Rascunho";
  if (v === "billed") return "Faturado";
  if (v === "cancelled") return "Cancelado";
  return s;
}

export function OrdersTable({ rows, loading, onView }: Props) {
  return (
    <div className="rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="text-left p-3">Pedido</th>
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
          ) : rows.length === 0 ? (
            <tr><td className="p-3" colSpan={6}>Nenhum pedido encontrado.</td></tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-medium">#{r.id}</td>
                <td className="p-3">#{r.customer_id}</td>
                <td className="p-3">{labelStatus(r.status)}</td>
                <td className="p-3 text-right tabular-nums">{Number(r.total).toFixed(2)}</td>
                <td className="p-3">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
                <td className="p-3 text-right">
                  <Button size="sm" onClick={() => onView(r.id)}>Ver</Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
