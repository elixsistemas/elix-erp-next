import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAccountsPayable } from "./useAccountsPayable";

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function badgeClass(status: string) {
  switch (status) {
    case "PAID":
      return "bg-emerald-100 text-emerald-700";
    case "CANCELED":
      return "bg-slate-100 text-slate-700";
    case "OVERDUE":
      return "bg-red-100 text-red-700";
    case "PARTIAL":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-blue-100 text-blue-700";
  }
}

export default function AccountsPayablePage() {
  const ap = useAccountsPayable();

  const totals = useMemo(() => {
    return ap.rows.reduce(
      (acc, row) => {
        acc.amount += Number(row.amount);
        acc.open += Number(row.open_amount);
        return acc;
      },
      { amount: 0, open: 0 },
    );
  }, [ap.rows]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contas a pagar</h1>
          <p className="text-sm text-muted-foreground">
            Gestão de títulos e obrigações financeiras com fornecedores.
          </p>
        </div>

        <Button asChild>
          <Link to="/financeiro/contas-pagar/nova">Novo título</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border p-4">
          <div className="text-xs text-muted-foreground">Qtde. títulos</div>
          <div className="mt-2 text-2xl font-semibold">{ap.rows.length}</div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-xs text-muted-foreground">Valor total</div>
          <div className="mt-2 text-2xl font-semibold">{money(totals.amount)}</div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-xs text-muted-foreground">Saldo em aberto</div>
          <div className="mt-2 text-2xl font-semibold">{money(totals.open)}</div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-xs text-muted-foreground">Somente vencidos</div>
          <div className="mt-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={ap.overdueOnly}
                onChange={(e) => ap.setOverdueOnly(e.target.checked)}
              />
              Mostrar vencidos
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="h-10 rounded-md border px-3"
            placeholder="Buscar por fornecedor, documento ou descrição"
            value={ap.q}
            onChange={(e) => ap.setQ(e.target.value)}
          />

          <select
            className="h-10 rounded-md border px-3"
            value={ap.status}
            onChange={(e) => ap.setStatus(e.target.value as any)}
          >
            <option value="">Todos os status</option>
            <option value="OPEN">Aberto</option>
            <option value="PARTIAL">Parcial</option>
            <option value="PAID">Pago</option>
            <option value="OVERDUE">Vencido</option>
            <option value="CANCELED">Cancelado</option>
          </select>

          <Button variant="outline" onClick={ap.reload}>
            Recarregar
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-4 py-3">Fornecedor</th>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Emissão</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Parcela</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Saldo</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {ap.loading ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={10}>
                    Carregando...
                  </td>
                </tr>
              ) : ap.rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={10}>
                    Nenhum título encontrado.
                  </td>
                </tr>
              ) : (
                ap.rows.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-4 py-3">{row.supplier_name}</td>
                    <td className="px-4 py-3">{row.document_number ?? "—"}</td>
                    <td className="px-4 py-3">{row.description}</td>
                    <td className="px-4 py-3">{row.issue_date}</td>
                    <td className="px-4 py-3">{row.due_date}</td>
                    <td className="px-4 py-3">
                      {row.installment_no && row.installment_count
                        ? `${row.installment_no}/${row.installment_count}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">{money(Number(row.amount))}</td>
                    <td className="px-4 py-3">{money(Number(row.open_amount))}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/financeiro/contas-pagar/${row.id}`}>Ver</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/financeiro/contas-pagar/${row.id}/editar`}>Editar</Link>
                        </Button>
                      </div>
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