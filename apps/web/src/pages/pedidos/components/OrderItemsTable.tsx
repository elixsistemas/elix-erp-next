// apps/web/src/pages/pedidos/components/OrderItemsTable.tsx
import type { OrderItemRow } from "../orders.types";

function labelKind(k: string) {
  return String(k).toLowerCase() === "service" ? "Serviço" : "Produto";
}

export function OrderItemsTable({ items }: { items: OrderItemRow[] }) {
  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="p-3 border-b bg-muted/40 font-medium">Itens</div>
      <table className="w-full text-sm">
        <thead className="bg-muted/20">
          <tr>
            <th className="text-left p-3">Descrição</th>
            <th className="text-left p-3">Tipo</th>
            <th className="text-right p-3">Qtd</th>
            <th className="text-right p-3">Unit</th>
            <th className="text-right p-3">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-t">
              <td className="p-3">
                <div className="font-medium">{it.description}</div>
                <div className="text-xs text-muted-foreground">Produto #{it.product_id}</div>
              </td>
              <td className="p-3">{labelKind(it.kind)}</td>
              <td className="p-3 text-right tabular-nums">{Number(it.quantity).toFixed(3)}</td>
              <td className="p-3 text-right tabular-nums">{Number(it.unit_price).toFixed(2)}</td>
              <td className="p-3 text-right tabular-nums">{Number(it.total).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
