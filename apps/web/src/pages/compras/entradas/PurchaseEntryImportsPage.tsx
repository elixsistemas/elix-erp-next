import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePurchaseEntryImports } from "./usePurchaseEntryImports";

function badgeClass(status: string) {
  switch (status) {
    case "READY":
      return "bg-emerald-100 text-emerald-700";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-700";
    case "MATCH_PENDING":
      return "bg-amber-100 text-amber-700";
    case "ERROR":
      return "bg-red-100 text-red-700";
    case "CANCELED":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-muted text-foreground";
  }
}

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

export default function PurchaseEntryImportsPage() {
  const st = usePurchaseEntryImports();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Entradas de compra</h1>
          <p className="text-sm text-muted-foreground">
            Importação de XML com staging e confirmação operacional.
          </p>
        </div>

        <Button asChild>
          <Link to="/compras/entradas/importar-xml">Importar XML</Link>
        </Button>
      </div>

      <div className="rounded-xl border p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="h-10 rounded-md border px-3"
            placeholder="Buscar por chave, fornecedor ou número"
            value={st.q}
            onChange={(e) => st.setQ(e.target.value)}
          />

          <select
            className="h-10 rounded-md border px-3"
            value={st.status}
            onChange={(e) => st.setStatus(e.target.value as any)}
          >
            <option value="">Todos os status</option>
            <option value="MATCH_PENDING">Pendentes</option>
            <option value="READY">Prontas</option>
            <option value="CONFIRMED">Confirmadas</option>
            <option value="ERROR">Erro</option>
            <option value="CANCELED">Canceladas</option>
          </select>

          <Button variant="outline" onClick={st.reload}>
            Recarregar
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-4 py-3">Chave</th>
                <th className="px-4 py-3">Fornecedor XML</th>
                <th className="px-4 py-3">Número/Série</th>
                <th className="px-4 py-3">Emissão</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {st.loading ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={7}>
                    Carregando...
                  </td>
                </tr>
              ) : st.rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={7}>
                    Nenhuma importação encontrada.
                  </td>
                </tr>
              ) : (
                st.rows.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-4 py-3">{row.access_key}</td>
                    <td className="px-4 py-3">{row.supplier_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      {row.invoice_number ?? "—"} / {row.invoice_series ?? "—"}
                    </td>
                    <td className="px-4 py-3">{row.issue_date ?? "—"}</td>
                    <td className="px-4 py-3">{money(row.total_amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/compras/entradas/${row.id}`}>Abrir</Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}