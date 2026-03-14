import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { listPurchaseEntries } from "./purchase-entry-imports.service";
import type { PurchaseEntryRow } from "./purchase-entry-imports.types";

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function badgeClass(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "bg-blue-100 text-blue-700";
    case "POSTED":
      return "bg-emerald-100 text-emerald-700";
    case "CANCELED":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-muted text-foreground";
  }
}

export default function PurchaseEntriesPage() {
  const [rows, setRows] = useState<PurchaseEntryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const data = await listPurchaseEntries({
        q: q || undefined,
        status: status || undefined,
        limit: 100,
        offset: 0,
      });
      setRows(data);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao carregar entradas definitivas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Entradas definitivas</h1>
          <p className="text-sm text-muted-foreground">
            Documentos oficiais de entrada de compra já confirmados
          </p>
        </div>

        <Link to="/compras/entradas">
          <Button variant="outline">Ver importações</Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-sm">
          <span>Buscar</span>
          <input
            className="w-72 rounded border px-3 py-2"
            placeholder="NF, fornecedor ou chave..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>

        <label className="space-y-1 text-sm">
          <span>Status</span>
          <select
            className="rounded border px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="POSTED">Postado</option>
            <option value="CANCELED">Cancelado</option>
          </select>
        </label>

        <Button onClick={() => void load()}>Atualizar</Button>
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Fornecedor</th>
              <th className="px-3 py-2">NF</th>
              <th className="px-3 py-2">Entrada</th>
              <th className="px-3 py-2">Custo</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-center text-muted-foreground">
                  Carregando...
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-center text-muted-foreground">
                  Nenhuma entrada definitiva encontrada.
                </td>
              </tr>
            )}

            {rows.map((row) => (
              <tr key={row.id} className="border-b">
                <td className="px-3 py-2">
                  <span className={`rounded px-2 py-1 text-xs font-medium ${badgeClass(row.status)}`}>
                    {row.status}
                  </span>
                </td>

                <td className="px-3 py-2">
                  <div className="font-medium">{row.supplier_name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{row.supplier_document ?? "—"}</div>
                </td>

                <td className="px-3 py-2">
                  {row.invoice_number ?? "—"} / {row.invoice_series ?? "—"}
                </td>

                <td className="px-3 py-2">{row.entry_date ?? "—"}</td>

                <td className="px-3 py-2">
                  <div className="text-xs text-muted-foreground">Política</div>
                  <div className="font-medium">{row.cost_policy}</div>
                </td>

                <td className="px-3 py-2">{money(row.total_amount)}</td>

                <td className="px-3 py-2 text-right">
                  <Link
                    to={`/compras/entradas/entry/${row.id}`}
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