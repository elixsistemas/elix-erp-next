import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type QuoteItemDraft = {
  productId: number | "";
  description: string;
  quantity: number;
  unitPrice: number;
};

type Props = {
  items: QuoteItemDraft[];
  onChange: (items: QuoteItemDraft[]) => void;
};

export function QuoteItemsEditor({ items, onChange }: Props) {
  function add() {
    onChange([
      ...items,
      { productId: "", description: "", quantity: 1, unitPrice: 0 },
    ]);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function update(index: number, patch: Partial<QuoteItemDraft>) {
    const next = items.map((it, i) => (i === index ? { ...it, ...patch } : it));
    onChange(next);
  }

  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="p-3 border-b bg-muted/40 font-medium flex items-center justify-between">
        <div>Itens</div>
        <Button size="sm" variant="secondary" onClick={add}>Adicionar</Button>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-muted/20">
          <tr>
            <th className="text-left p-3">Produto (ID)</th>
            <th className="text-left p-3">Descrição</th>
            <th className="text-right p-3">Qtd</th>
            <th className="text-right p-3">Unit</th>
            <th className="text-right p-3"></th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td className="p-3" colSpan={5}>Adicione itens.</td></tr>
          ) : items.map((it, idx) => (
            <tr className="border-t" key={idx}>
              <td className="p-3">
                <Input
                  inputMode="numeric"
                  value={it.productId === "" ? "" : String(it.productId)}
                  onChange={(e) => update(idx, { productId: e.target.value ? Number(e.target.value) : "" })}
                  placeholder="Ex: 1"
                />
              </td>
              <td className="p-3">
                <Input value={it.description} onChange={(e) => update(idx, { description: e.target.value })} />
              </td>
              <td className="p-3 text-right">
                <Input
                  inputMode="decimal"
                  value={String(it.quantity)}
                  onChange={(e) => update(idx, { quantity: Number(e.target.value || 0) })}
                />
              </td>
              <td className="p-3 text-right">
                <Input
                  inputMode="decimal"
                  value={String(it.unitPrice)}
                  onChange={(e) => update(idx, { unitPrice: Number(e.target.value || 0) })}
                />
              </td>
              <td className="p-3 text-right">
                <Button size="sm" variant="secondary" onClick={() => remove(idx)}>Remover</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
