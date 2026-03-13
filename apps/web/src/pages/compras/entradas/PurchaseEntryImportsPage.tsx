import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePurchaseEntryImports } from "./usePurchaseEntryImports";

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

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

export default function PurchaseEntryImportsPage() {
  const st = usePurchaseEntryImports();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Entradas de compras</h1>
          <p className="text-sm text-muted-foreground">
            Importações de XML de nota fiscal de compra
          </p>
        </div>

        <Link to="/compras/entradas/importar-xml">
          <Button>Importar XML</Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-sm">
          <span>Buscar</span>
          <input
            className="w-72 rounded border px-3 py-2"
            placeholder="NF, fornecedor ou chave..."
            value={st.q}
            onChange={(e) => st.setQ(e.target.value)}
          />
        </label>

        <label className="space-y-1 text-sm">
          <span>Status</span>
          <select
            className="rounded border px-3 py-2"
            value={st.status}
            onChange={(e) => st.setStatus(e.target.value as any)}
          >
            <option value="">Todos</option>
            <option value="IMPORTED">Importado</option>
            <option value="MATCH_PENDING">Match pendente</option>
            <option value="READY">Pronto</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="ERROR">Erro</option>
            <option value="CANCELED">Cancelado</option>
          </select>
        </label>

        <Button variant="outline" onClick={() => void st.reload()}>
          Atualizar
        </Button>
      </div>

      {st.error && (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {st.error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Fornecedor</th>
              <th className="px-3 py-2">Documento</th>
              <th className="px-3 py-2">NF</th>
              <th className="px-3 py-2">Emissão</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Entrada</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>

          <tbody>
            {st.loading && (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-center text-muted-foreground">
                  Carregando...
                </td>
              </tr>
            )}

            {!st.loading && st.rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-center text-muted-foreground">
                  Nenhuma importação encontrada.
                </td>
              </tr>
            )}

            {st.rows.map((row) => (
              <tr key={row.id} className="border-b">
                <td className="px-3 py-2">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${badgeClass(
                      row.status,
                    )}`}
                  >
                    {row.status}
                  </span>
                </td>

                <td className="px-3 py-2">
                  <div className="font-medium">{row.supplier_name ?? "—"}</div>
                </td>

                <td className="px-3 py-2">{row.supplier_document ?? "—"}</td>

                <td className="px-3 py-2">
                  {row.invoice_number ?? "—"} / {row.invoice_series ?? "—"}
                </td>

                <td className="px-3 py-2">{row.issue_date ?? "—"}</td>

                <td className="px-3 py-2">{money(row.total_amount)}</td>

                <td className="px-3 py-2">
                  {row.definitive_purchase_entry_id ? (
                    <span className="text-emerald-700 font-medium">
                      #{row.definitive_purchase_entry_id}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      —
                    </span>
                  )}
                </td>

                <td className="px-3 py-2 text-right">
                  <Link
                    to={`/compras/entradas/${row.id}`}
                    className="text-sm underline"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}