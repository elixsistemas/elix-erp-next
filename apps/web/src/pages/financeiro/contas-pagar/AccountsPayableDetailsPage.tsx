import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getAccountsPayableById, updateAccountsPayableStatus } from "./accounts-payable.service";
import type { AccountsPayableRow, AccountsPayableStatus } from "./accounts-payable.types";

function money(value: number | null | undefined) {
  if (value == null) return "—";

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function AccountsPayableDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [row, setRow] = useState<AccountsPayableRow | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!params.id) return;
    const data = await getAccountsPayableById(Number(params.id));
    setRow(data);
  }

  useEffect(() => {
    void load();
  }, [params.id]);

  async function changeStatus(status: AccountsPayableStatus) {
    if (!params.id) return;
    setLoading(true);
    try {
      await updateAccountsPayableStatus(Number(params.id), status);
      await load();
    } finally {
      setLoading(false);
    }
  }

  if (!row) {
    return <div className="text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Conta a pagar #{row.id}</h1>
          <p className="text-sm text-muted-foreground">{row.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/financeiro/contas-pagar/${row.id}/editar`)}>
            Editar
          </Button>
          <Button variant="outline" onClick={() => navigate("/financeiro/contas-pagar")}>
            Voltar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border p-4 md:grid-cols-2 lg:grid-cols-3">
        <div><div className="text-xs text-muted-foreground">Fornecedor</div><div className="mt-1 font-medium">{row.supplier_name}</div></div>
        <div><div className="text-xs text-muted-foreground">Documento</div><div className="mt-1 font-medium">{row.document_number ?? "—"}</div></div>
        <div><div className="text-xs text-muted-foreground">Status</div><div className="mt-1 font-medium">{row.status}</div></div>
        <div><div className="text-xs text-muted-foreground">Emissão</div><div className="mt-1 font-medium">{row.issue_date}</div></div>
        <div><div className="text-xs text-muted-foreground">Vencimento</div><div className="mt-1 font-medium">{row.due_date}</div></div>
        <div><div className="text-xs text-muted-foreground">Competência</div><div className="mt-1 font-medium">{row.competence_date ?? "—"}</div></div>
        <div><div className="text-xs text-muted-foreground">Valor</div><div className="mt-1 font-medium">{money(Number(row.amount))}</div></div>
        <div><div className="text-xs text-muted-foreground">Saldo aberto</div><div className="mt-1 font-medium">{money(Number(row.open_amount))}</div></div>
        <div><div className="text-xs text-muted-foreground">Plano de contas</div><div className="mt-1 font-medium">{row.chart_account_name ?? "—"}</div></div>
        <div><div className="text-xs text-muted-foreground">Centro de custo</div><div className="mt-1 font-medium">{row.cost_center_name ?? "—"}</div></div>
        <div><div className="text-xs text-muted-foreground">Condição</div><div className="mt-1 font-medium">{row.payment_term_name ?? "—"}</div></div>
        <div><div className="text-xs text-muted-foreground">Meio</div><div className="mt-1 font-medium">{row.payment_method_name ?? "—"}</div></div>
      </div>

      <div className="rounded-xl border p-4">
        <div className="text-sm font-medium">Observações</div>
        <div className="mt-2 text-sm text-muted-foreground">{row.notes ?? "Sem observações."}</div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button disabled={loading} onClick={() => changeStatus("OPEN")}>Marcar aberto</Button>
        <Button disabled={loading} variant="outline" onClick={() => changeStatus("PAID")}>Marcar pago</Button>
        <Button disabled={loading} variant="outline" onClick={() => changeStatus("CANCELED")}>Cancelar</Button>
      </div>
    </div>
  );
}