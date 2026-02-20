import type { QuoteItemRow } from "../quotes.types";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function QuoteItemsTable({ items }: { items: QuoteItemRow[] }) {
  return (
    <div className="rounded-xl border overflow-hidden">
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
          {items.map((it) => (
            <tr key={it.id} className="border-t">
              <td className="p-3">
                <div className="font-medium">{it.description}</div>
                <div className="text-xs text-muted-foreground">Produto #{it.product_id}</div>
              </td>
              <td className="p-3 text-right tabular-nums">{Number(it.quantity).toFixed(3)}</td>
              <td className="p-3 text-right tabular-nums">{brl.format(Number(it.unit_price))}</td>
              <td className="p-3 text-right tabular-nums">{brl.format(Number(it.total))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
