import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { createQuote } from "./quotes.service";
import { QuoteItemsEditor, type QuoteItemDraft } from "./components/QuoteItemsEditor";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function QuoteCreatePage() {
  const nav = useNavigate();

  const [customerId, setCustomerId] = React.useState<number | "">("");
  const [discount, setDiscount] = React.useState<number>(0);
  const [notes, setNotes] = React.useState<string>("");

  const [items, setItems] = React.useState<QuoteItemDraft[]>([
    { productId: "", description: "", quantity: 1, unitPrice: 0 },
  ]);

  const [saving, setSaving] = React.useState(false);

  const subtotal = round2(items.reduce((acc, it) => acc + Number(it.quantity || 0) * Number(it.unitPrice || 0), 0));
  const total = Math.max(0, round2(subtotal - Number(discount || 0)));

  async function save() {
    if (customerId === "" || !Number.isFinite(Number(customerId))) {
      toast.error("Informe o cliente (ID).");
      return;
    }
    if (items.some((it) => it.productId === "" || !it.description.trim())) {
      toast.error("Preencha productId e descrição em todos os itens.");
      return;
    }

    setSaving(true);
    try {
      const res = await createQuote({
        customerId: Number(customerId),
        discount: Number(discount || 0),
        notes: notes.trim() ? notes.trim() : null,
        items: items.map((it) => ({
          productId: Number(it.productId),
          description: it.description,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
        })),
      });

      toast.success("Orçamento criado.");
      nav(`/quotes/${res.quote.id}`);
    } catch (e: any) {
      toast.error(String(e?.message ?? "Erro ao criar orçamento").slice(0, 200));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-muted-foreground">Orçamento</div>
          <h1 className="text-xl font-semibold">Novo orçamento</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => nav("/quotes")}>Voltar</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="rounded-xl border p-4 space-y-2">
          <div className="text-xs text-muted-foreground">Cliente (ID)</div>
          <Input inputMode="numeric" value={customerId === "" ? "" : String(customerId)} onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : "")} placeholder="Ex: 1" />
        </div>

        <div className="rounded-xl border p-4 space-y-2">
          <div className="text-xs text-muted-foreground">Desconto</div>
          <Input inputMode="decimal" value={String(discount)} onChange={(e) => setDiscount(Number(e.target.value || 0))} />
        </div>

        <div className="rounded-xl border p-4 space-y-1">
          <div className="text-xs text-muted-foreground">Totais</div>
          <div className="text-sm">Subtotal: <span className="tabular-nums">{subtotal.toFixed(2)}</span></div>
          <div className="text-sm">Total: <span className="tabular-nums font-semibold">{total.toFixed(2)}</span></div>
        </div>
      </div>

      <div className="rounded-xl border p-4 space-y-2">
        <div className="text-xs text-muted-foreground">Observações</div>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: validade 7 dias, frete, prazo..." />
      </div>

      <QuoteItemsEditor items={items} onChange={setItems} />

      <div className="text-[11px] text-muted-foreground">
        Futuro: seleção de produtos com busca, impostos, frete, condições, anexos, template e envio.
      </div>
    </div>
  );
}
