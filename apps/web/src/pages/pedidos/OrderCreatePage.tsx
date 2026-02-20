import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { createOrder } from "./orders.service";

type DraftItem = {
  productId: number | "";
  kind: "product" | "service";
  description: string;
  quantity: number;
  unitPrice: number;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function OrderCreatePage() {
  const nav = useNavigate();

  const [customerId, setCustomerId] = React.useState<number | "">("");
  const [quoteId, setQuoteId] = React.useState<number | "">("");
  const [discount, setDiscount] = React.useState<number>(0);
  const [notes, setNotes] = React.useState<string>("");

  const [items, setItems] = React.useState<DraftItem[]>([
    { productId: "", kind: "product", description: "", quantity: 1, unitPrice: 0 },
  ]);

  const [saving, setSaving] = React.useState(false);

  const subtotal = round2(items.reduce((acc, it) => acc + Number(it.quantity || 0) * Number(it.unitPrice || 0), 0));
  const total = Math.max(0, round2(subtotal - Number(discount || 0)));

  function addItem() {
    setItems((prev) => [...prev, { productId: "", kind: "product", description: "", quantity: 1, unitPrice: 0 }]);
  }
  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    if (customerId === "" || !Number.isFinite(Number(customerId))) return toast.error("Informe o cliente (ID).");
    if (items.some((it) => it.productId === "" || !it.description.trim())) return toast.error("Preencha itens.");

    setSaving(true);
    try {
      const payloadItems = items.map((it) => {
        const lineTotal = round2(Number(it.quantity) * Number(it.unitPrice));
        return {
          productId: Number(it.productId),
          kind: it.kind,
          description: it.description,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          total: lineTotal,
        };
      });

      const res = await createOrder({
        quoteId: quoteId === "" ? null : Number(quoteId),
        customerId: Number(customerId),
        notes: notes.trim() ? notes.trim() : null,
        discount: Number(discount || 0),
        subtotal,
        total,
        items: payloadItems,
      });

      toast.success("Pedido criado.");
      nav(`/orders/${res.order.id}`);
    } catch (e: any) {
      toast.error(String(e?.message ?? "Erro ao criar pedido").slice(0, 200));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-muted-foreground">Pedido</div>
          <h1 className="text-xl font-semibold">Novo pedido</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => nav("/orders")}>Voltar</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border p-4 space-y-2">
          <div className="text-xs text-muted-foreground">Cliente (ID)</div>
          <Input inputMode="numeric" value={customerId === "" ? "" : String(customerId)} onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : "")} />
        </div>

        <div className="rounded-xl border p-4 space-y-2">
          <div className="text-xs text-muted-foreground">Quote (opcional)</div>
          <Input inputMode="numeric" value={quoteId === "" ? "" : String(quoteId)} onChange={(e) => setQuoteId(e.target.value ? Number(e.target.value) : "")} placeholder="Ex: 12" />
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
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="p-3 border-b bg-muted/40 font-medium flex items-center justify-between">
          <div>Itens</div>
          <Button size="sm" variant="secondary" onClick={addItem}>Adicionar</Button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-muted/20">
            <tr>
              <th className="text-left p-3">Produto (ID)</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-left p-3">Descrição</th>
              <th className="text-right p-3">Qtd</th>
              <th className="text-right p-3">Unit</th>
              <th className="text-right p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr className="border-t" key={idx}>
                <td className="p-3">
                  <Input inputMode="numeric" value={it.productId === "" ? "" : String(it.productId)} onChange={(e) => {
                    const v = e.target.value ? Number(e.target.value) : "";
                    setItems((prev) => prev.map((x, i) => i === idx ? { ...x, productId: v } : x));
                  }} />
                </td>
                <td className="p-3">
                  <select
                    className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                    value={it.kind}
                    onChange={(e) => {
                      const v = e.target.value as any;
                      setItems((prev) => prev.map((x, i) => i === idx ? { ...x, kind: v } : x));
                    }}
                  >
                    <option value="product">Produto</option>
                    <option value="service">Serviço</option>
                  </select>
                </td>
                <td className="p-3">
                  <Input value={it.description} onChange={(e) => {
                    const v = e.target.value;
                    setItems((prev) => prev.map((x, i) => i === idx ? { ...x, description: v } : x));
                  }} />
                </td>
                <td className="p-3 text-right">
                  <Input inputMode="decimal" value={String(it.quantity)} onChange={(e) => {
                    const v = Number(e.target.value || 0);
                    setItems((prev) => prev.map((x, i) => i === idx ? { ...x, quantity: v } : x));
                  }} />
                </td>
                <td className="p-3 text-right">
                  <Input inputMode="decimal" value={String(it.unitPrice)} onChange={(e) => {
                    const v = Number(e.target.value || 0);
                    setItems((prev) => prev.map((x, i) => i === idx ? { ...x, unitPrice: v } : x));
                  }} />
                </td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="secondary" onClick={() => removeItem(idx)}>Remover</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-muted-foreground">
        Futuro: seleção de produto com busca, preço sugerido, estoque disponível, margem, aprovações.
      </div>
    </div>
  );
}
