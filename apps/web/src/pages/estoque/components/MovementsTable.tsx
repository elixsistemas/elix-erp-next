import type { InventoryMovementRow, ProductMini } from "../inventory.types";

type Props = {
  rows: InventoryMovementRow[];
  loading?: boolean;
  productsMap: Map<number, ProductMini>;
};

function labelType(t: string) {
  switch (t) {
    case "IN":
      return "Entrada";
    case "OUT":
      return "Saída";
    case "ADJUST_POS":
      return "Ajuste +";
    case "ADJUST_NEG":
      return "Ajuste -";
    default:
      return t;
  }
}

export function MovementsTable({ rows, loading, productsMap }: Props) {
  return (
    <div className="rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="text-left p-3">Data</th>
            <th className="text-left p-3">Produto</th>
            <th className="text-left p-3">Tipo</th>
            <th className="text-right p-3">Qtd</th>
            <th className="text-left p-3">Origem</th>
            <th className="text-left p-3">Obs</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td className="p-3" colSpan={6}>
                Carregando...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td className="p-3" colSpan={6}>
                Nenhuma movimentação encontrada.
              </td>
            </tr>
          ) : (
            rows.map((r) => {
              const p = productsMap.get(r.product_id);

              const originLabel = (r as any).source_type ?? r.source; // compat
              const reasonLabel = (r as any).reason;

              return (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{new Date(r.created_at).toLocaleString("pt-BR")}</td>

                  <td className="p-3">
                    <div className="font-medium">{p?.name ?? `#${r.product_id}`}</div>
                    <div className="text-xs text-muted-foreground">ID: {r.product_id}</div>
                  </td>

                  <td className="p-3">{labelType(r.type)}</td>

                  <td className="p-3 text-right tabular-nums">{r.quantity}</td>

                  <td className="p-3">
                    {originLabel ? (
                      <div>
                        <div className="font-medium">
                          {String(originLabel)}
                          {r.source_id ? ` #${r.source_id}` : ""}
                        </div>
                        {reasonLabel ? (
                          <div className="text-xs text-muted-foreground">Motivo: {String(reasonLabel)}</div>
                        ) : null}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="p-3">{r.note ?? "-"}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
