import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type { QuoteCreate, QuoteDetails, QuoteItemUpsert } from "./quotes.types";
import { useQuoteDetails } from "./useQuoteDetails";
import { approveQuote, cancelQuote, updateQuote } from "./quotes.service";
import { QuoteActionsBar } from "./components/QuoteActionsBar";
import { QuoteItemsEditor } from "./components/QuoteItemsEditor";
import { QuoteTotalsCard } from "./components/QuoteTotalsCard";
import { CustomerCombobox } from "./components/CustomerCombobox";
import { sanitizePtBrDecimalInput, parsePtBrDecimal, formatPtBrFixed } from "./components/ptbrDecimal";

function statusBadge(status?: string) {
  if (status === "approved") return <Badge>Aprovado</Badge>;
  if (status === "cancelled") return <Badge variant="destructive">Cancelado</Badge>;
  return <Badge variant="secondary">Rascunho</Badge>;
}

export default function QuoteDetailsPage() {
  const { id } = useParams();
  const quoteId = Number(id);
  const vm = useQuoteDetails(quoteId);

  return (
    <QuoteDetailsEditor
      mode="edit"
      initial={vm.data}
      loading={vm.loading}
      onReload={vm.reload}
      onSave={async (payload) => {
        const updated = await updateQuote(quoteId, payload);
        toast.success("Orçamento atualizado");
        vm.reload();
        return updated;
      }}
    />
  );
}

export function QuoteDetailsEditor(props: {
  mode: "create" | "edit";
  initial: QuoteDetails | null;
  loading?: boolean;
  onReload?: () => void;
  onSave: (payload: QuoteCreate) => Promise<any>;
}) {
  const nav = useNavigate();

  const isEdit = props.mode === "edit";
  const quote = props.initial?.quote;
  const locked = isEdit && quote && quote.status !== "draft";

  const [customerId, setCustomerId] = React.useState<number | null>(quote?.customer_id ?? null);
  const [notes, setNotes] = React.useState<string>(quote?.notes ?? "");
  const [discountText, setDiscountText] = React.useState<string>(formatPtBrFixed(Number(quote?.discount ?? 0), 2));

  const [items, setItems] = React.useState<QuoteItemUpsert[]>(() => {
    const src = props.initial?.items ?? [];
    return src.map((it) => ({
      productId: it.product_id,
      description: it.description,
      quantity: Number(it.quantity),
      unitPrice: Number(it.unit_price),
    }));
  });

  React.useEffect(() => {
    if (!props.initial) return;
    setCustomerId(props.initial.quote.customer_id);
    setNotes(props.initial.quote.notes ?? "");
    setDiscountText(formatPtBrFixed(Number(props.initial.quote.discount ?? 0), 2));
    setItems(
      props.initial.items.map((it) => ({
        productId: it.product_id,
        description: it.description,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unit_price),
      }))
    );
  }, [props.initial?.quote?.id]);

  async function handleSave() {
    if (!customerId) return toast.error("Selecione um cliente");
    if (items.length < 1) return toast.error("Adicione ao menos 1 item");

    const d = parsePtBrDecimal(discountText);
    if (d === null || d < 0) return toast.error("Desconto inválido");

    // valida itens
    for (const it of items) {
      if (!it.productId) return toast.error("Item sem produto");
      if (!it.description?.trim()) return toast.error("Item sem descrição");
      if (!(Number(it.quantity) > 0)) return toast.error("Quantidade inválida");
      if (!(Number(it.unitPrice) >= 0)) return toast.error("Preço unitário inválido");
    }

    const payload: QuoteCreate = {
      customerId,
      discount: d,
      notes: notes?.trim() ? notes.trim() : null,
      items,
    };

    await props.onSave(payload);
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-xl font-semibold flex items-center gap-2">
            {isEdit ? `Orçamento #${quote?.id ?? ""}` : "Novo orçamento"}
            {isEdit ? statusBadge(quote?.status) : null}
          </div>
          <div className="text-sm text-muted-foreground">
            Editor robusto com busca, autofill e totais consistentes.
          </div>
        </div>

        <div className="flex gap-2">
          {isEdit ? (
            <Button variant="outline" onClick={() => nav(`/comercial/orcamentos/${quote?.id}/print`)}>
              Imprimir / PDF
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => nav("/comercial/orcamentos")}>
            Voltar
          </Button>
        </div>
      </div>

      <QuoteActionsBar
        disabled={Boolean(locked)}
        status={quote?.status}
        onSave={handleSave}
        onApprove={async () => {
          if (!quote?.id) return;
          try {
            await approveQuote(quote.id);
            toast.success("Orçamento aprovado");
            props.onReload?.();
          } catch (e: any) {
            toast.error(e?.message ?? "Falha ao aprovar");
          }
        }}
        onCancel={async () => {
          if (!quote?.id) return;
          try {
            await cancelQuote(quote.id);
            toast.success("Orçamento cancelado");
            props.onReload?.();
          } catch (e: any) {
            toast.error(e?.message ?? "Falha ao cancelar");
          }
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="border rounded-lg p-4 space-y-3 lg:col-span-2">
          <div className="font-medium">Cliente</div>
          <CustomerCombobox
            value={customerId}
            onChange={setCustomerId}
            disabled={Boolean(locked)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Desconto</div>
              <input
                className="w-full border rounded-md px-3 py-2 bg-background"
                value={discountText}
                disabled={Boolean(locked)}
                onChange={(e) => setDiscountText(sanitizePtBrDecimalInput(e.target.value))}
                onBlur={() => {
                  const n = parsePtBrDecimal(discountText);
                  if (n === null) return;
                  setDiscountText(formatPtBrFixed(n, 2));
                }}
                inputMode="decimal"
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Observações</div>
              <input
                className="w-full border rounded-md px-3 py-2 bg-background"
                value={notes}
                disabled={Boolean(locked)}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Prazo, condições, detalhes..."
              />
            </div>
          </div>
        </div>

        <QuoteTotalsCard items={items} discountText={discountText} />
      </div>

      <div className="border rounded-lg p-4">
        <div className="font-medium mb-3">Itens</div>
        <QuoteItemsEditor
          locked={Boolean(locked)}
          items={items}
          onChange={setItems}
        />
      </div>
    </div>
  );
}
