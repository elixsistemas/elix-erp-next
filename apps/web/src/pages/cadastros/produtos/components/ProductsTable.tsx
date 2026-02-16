import type { Product } from "../products.types";
import { Button } from "@/components/ui/button";

type Props = {
  rows: Product[];
  loading?: boolean;
  onEdit: (row: Product) => void;
  onDelete: (row: Product) => void;
};

export function ProductsTable({ rows, loading, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="text-left p-3">Nome</th>
            <th className="text-left p-3">SKU</th>
            <th className="text-left p-3">NCM</th>
            <th className="text-left p-3">EAN</th>
            <th className="text-right p-3">Preço</th>
            <th className="text-right p-3">Custo</th>
            <th className="text-right p-3">Ações</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td className="p-3" colSpan={7}>Carregando...</td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td className="p-3" colSpan={7}>Nenhum produto encontrado.</td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.sku ?? "-"}</td>
                <td className="p-3">{r.ncm ?? "-"}</td>
                <td className="p-3">{r.ean ?? "-"}</td>
                <td className="p-3 text-right">{(r.price ?? 0).toFixed(2)}</td>
                <td className="p-3 text-right">{(r.cost ?? 0).toFixed(2)}</td>
                <td className="p-3 text-right space-x-2">
                  <Button variant="secondary" onClick={() => onEdit(r)}>Editar</Button>
                  <Button variant="destructive" onClick={() => onDelete(r)}>Excluir</Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
