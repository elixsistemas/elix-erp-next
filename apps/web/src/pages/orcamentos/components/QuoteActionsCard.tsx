import { Button } from "@/components/ui/button";
import type { QuoteDetails } from "../quotes.types";

type Props = {
  data: QuoteDetails;
  loading?: boolean;
  onReload: () => void;
  onApprove: () => Promise<void>;
  onCancel: () => Promise<void>;
  onCreateOrder: () => Promise<void>;
  onCreateSale: () => Promise<void>;
};

export function QuoteActionsCard({ data, loading, onReload, onApprove, onCancel, onCreateOrder, onCreateSale }: Props) {
  const status = String(data.quote.status).toLowerCase();
  const canApprove = status === "draft";
  const canCancel = status === "draft";
  const canConvert = status !== "cancelled"; // permitido draft/approved

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-medium">Ações</div>
        <Button size="sm" variant="secondary" onClick={onReload} disabled={!!loading}>
          Atualizar
        </Button>
      </div>

      <div className="grid gap-2">
        <Button onClick={onApprove} disabled={!canApprove || !!loading}>
          Aprovar orçamento
        </Button>

        <Button variant="secondary" onClick={onCancel} disabled={!canCancel || !!loading}>
          Cancelar orçamento
        </Button>

        <div className="pt-2 border-t" />

        <Button onClick={onCreateOrder} disabled={!canConvert || !!loading}>
          Gerar pedido
        </Button>

        <Button variant="secondary" onClick={onCreateSale} disabled={!canConvert || !!loading}>
          Gerar venda
        </Button>
      </div>

      <div className="text-[11px] text-muted-foreground">
        Futuro: aprovação com assinatura, templates, validade, envio por e-mail/WhatsApp, versão do orçamento.
      </div>
    </div>
  );
}
