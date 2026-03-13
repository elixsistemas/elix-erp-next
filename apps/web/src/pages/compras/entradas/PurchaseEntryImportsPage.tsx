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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Entradas de compra</h1>
          <p className="text-sm text-muted-foreground">
            Importação de XML com staging e confirmação operacional.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/compras/entradas/importar">
            <Button>Importar XML</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
        <input
          className="rounded-md border px-3 py-2 text-sm"
          placeholder="Buscar por chave, fornecedor, número..."
          value={st.q}
          onChange={(e) => st.setQ(e.target.value)}
        />

        <select
          className="rounded-md border px-3 py-2 text-sm"
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

        <Button variant="outline" onClick={() => void st.reload()} disabled={st.loading}>
          Recarregar
        </Button>
      </div>

      <div className="rounded-lg border">
        {st.loading ? (
          <div className="p-6 text-sm text-muted-foreground">Carregando...</div>
        ) : st.rows.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            Nenhuma importação encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="px-3 py-2 font-medium">Chave</th>
                  <th className="px-3 py-2 font-medium">Fornecedor XML</th>
                  <th className="px-3 py-2 font-medium">Número/Série</th>
                  <th className="px-3 py-2 font-medium">Emissão</th>
                  <th className="px-3 py-2 font-medium">Valor</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Ações</th>
                </tr>
              </thead>

              <tbody>
                {st.rows.map((row) => (
                  <tr key={row.id} className="border-b last:border-b-0">
                    <td className="px-3 py-2 font-mono text-xs">{row.access_key}</td>

                    <td className="px-3 py-2">
                      <div>{row.supplier_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {row.supplier_document ?? "—"}
                      </div>
                    </td>

                    <td className="px-3 py-2">
                      {row.invoice_number ?? "—"} / {row.invoice_series ?? "—"}
                    </td>

                    <td className="px-3 py-2">{row.issue_date ?? "—"}</td>

                    <td className="px-3 py-2">{money(row.total_amount)}</td>

                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded px-2 py-1 text-xs font-medium ${badgeClass(
                          row.status,
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>

                    <td className="px-3 py-2">
                      <Link to={`/compras/entradas/${row.id}`}>
                        <Button variant="outline" size="sm">
                          Abrir
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}