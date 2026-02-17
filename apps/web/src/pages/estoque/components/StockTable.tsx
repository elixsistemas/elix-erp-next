import type { InventoryStockRow, ProductMini } from "../inventory.types";

type Props = {
  rows: InventoryStockRow[];
  loading?: boolean;
  productsMap: Map<number, ProductMini>;
};

export function StockTable({ rows, loading, productsMap }: Props) {
  return (
    <div className="rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="text-left p-3">Produto</th>
            <th className="text-left p-3">SKU</th>
            <th className="text-right p-3">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td className="p-3" colSpan={3}>Carregando...</td></tr>
          ) : rows.length === 0 ? (
            <tr><td className="p-3" colSpan={3}>Nenhum saldo encontrado.</td></tr>
          ) : (
            rows.map((r) => {
              const p = productsMap.get(r.product_id);
              return (
                <tr key={r.product_id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">{p?.name ?? `#${r.product_id}`}</div>
                    <div className="text-xs text-muted-foreground">ID: {r.product_id}</div>
                  </td>
                  <td className="p-3">{p?.sku ?? "-"}</td>
                  <td className="p-3 text-right tabular-nums">{r.on_hand}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
