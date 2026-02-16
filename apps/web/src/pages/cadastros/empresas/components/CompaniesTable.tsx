import type { Company } from "../companies.types";
import { Button } from "@/components/ui/button";

type Props = {
  rows: Company[];
  loading?: boolean;
  onEdit: (row: Company) => void;
  onDelete: (row: Company) => void;
};

export function CompaniesTable({ rows, loading, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="text-left p-3">Nome</th>
            <th className="text-left p-3">CNPJ</th>
            <th className="text-left p-3">Criada em</th>
            <th className="text-right p-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td className="p-3" colSpan={4}>Carregando...</td></tr>
          ) : rows.length === 0 ? (
            <tr><td className="p-3" colSpan={4}>Nenhuma empresa encontrada.</td></tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.cnpj ?? "-"}</td>
                <td className="p-3">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
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
