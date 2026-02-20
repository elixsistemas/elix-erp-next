import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QuotesToolbar } from "./components/QuotesToolbar";
import { QuotesTable } from "./components/QuotesTable";
import { useQuotesList } from "./useQuotesList";

export default function QuotesListPage() {
  const nav = useNavigate();
  const vm = useQuotesList();

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">Orçamentos</div>
          <div className="text-sm text-muted-foreground">
            Crie, aprove, imprima e converta em venda — com dados consistentes.
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={vm.reload} disabled={vm.loading}>
            Atualizar
          </Button>
          <Button onClick={() => nav("/comercial/orcamentos/new")}>Novo orçamento</Button>
        </div>
      </div>

      <QuotesToolbar vm={vm} />
      <QuotesTable rows={vm.rows} loading={vm.loading} />
    </div>
  );
}
